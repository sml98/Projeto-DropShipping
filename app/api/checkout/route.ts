import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { readBody } from "@/lib/server/access";
import { validateCustomer } from "@/lib/server/commerce-validation";
import { getEntity, listEntities, upsertOrder } from "@/lib/server/db";
import { analyzeOpportunity, selectBestOffer } from "@/lib/opportunity-engine";
import type {
  CommerceOrder,
  CommerceProduct,
  CommerceSupplier,
} from "@/lib/commerce-types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token)
      return NextResponse.json(
        {
          error: "Checkout indisponível: configure o Mercado Pago no servidor.",
        },
        { status: 503 },
      );
    const body = await readBody(req, 65536);
    if (
      !Array.isArray(body.items) ||
      body.items.length < 1 ||
      body.items.length > 20
    )
      throw new Error("Carrinho inválido.");
    const customer = validateCustomer(body.customer);
    const suppliers = listEntities<CommerceSupplier>("suppliers");
    const maxAgeMs =
      Math.max(1, Number(process.env.MAX_OFFER_AGE_HOURS || 72)) * 3600000;
    const orderItems = body.items.map((row: unknown) => {
      if (!row || typeof row !== "object") throw new Error("Item inválido.");
      const item = row as Record<string, unknown>;
      const product = getEntity<CommerceProduct>(
        "products",
        String(item.id || ""),
      );
      const quantity = Number(item.quantity);
      if (
        !product ||
        product.status !== "published" ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 10
      )
        throw new Error("Produto ou quantidade indisponível.");
      const analysis = analyzeOpportunity(product, suppliers);
      if (analysis.blockers.length)
        throw new Error(
          `${product.name} precisa ser revalidado: ${analysis.blockers[0]}`,
        );
      const offer = selectBestOffer(product, suppliers);
      if (
        !offer ||
        offer.stock === 0 ||
        (offer.stock != null && offer.stock < quantity)
      )
        throw new Error(`${product.name} está sem estoque suficiente.`);
      const checkedAt = Date.parse(offer.checkedAt);
      if (!Number.isFinite(checkedAt) || Date.now() - checkedAt > maxAgeMs)
        throw new Error(
          `${product.name} precisa de nova conferência de preço e estoque.`,
        );
      return { product, quantity, offer };
    });
    const id = randomUUID();
    const total = orderItems.reduce(
      (sum, item) => sum + item.product.targetPrice * item.quantity,
      0,
    );
    const now = new Date().toISOString();
    const order: CommerceOrder = {
      id,
      externalReference: id,
      paymentProvider: "mercado-pago",
      paymentStatus: "created",
      fulfillmentStatus: "not-ready",
      total: Math.round(total * 100) / 100,
      currency: "BRL",
      customer,
      items: orderItems.map(({ product, quantity, offer }) => ({
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.targetPrice,
        offerId: offer.id,
        supplierId: offer.supplierId,
        provider: offer.provider,
        providerProductId: offer.providerProductId,
        providerVariantId: offer.providerVariantId,
        providerLogisticName: offer.providerLogisticName,
      })),
      createdAt: now,
      updatedAt: now,
    };
    const baseUrl = process.env.STORE_BASE_URL?.replace(/\/$/, "");
    const payload: Record<string, unknown> = {
      items: orderItems.map(({ product, quantity }) => ({
        id: product.id,
        title: product.name,
        quantity,
        currency_id: "BRL",
        unit_price: product.targetPrice,
      })),
      payer: {
        name: customer.name,
        email: customer.email,
        phone: { number: customer.phone },
        address: {
          zip_code: customer.postalCode,
          street_name: customer.street,
          street_number: customer.number,
        },
      },
      shipments: {
        receiver_address: {
          zip_code: customer.postalCode,
          street_name: customer.street,
          street_number: customer.number,
          floor: customer.complement || "",
          apartment: "",
          city_name: customer.city,
          state_name: customer.state,
          country_name: "Brasil",
        },
      },
      external_reference: id,
      statement_descriptor: "DROPRADAR",
      metadata: { channel: "dropradar-storefront", order_id: id },
    };
    if (baseUrl?.startsWith("https://")) {
      payload.back_urls = {
        success: `${baseUrl}/loja?checkout=success`,
        pending: `${baseUrl}/loja?checkout=pending`,
        failure: `${baseUrl}/loja?checkout=failure`,
      };
      payload.auto_return = "approved";
      payload.notification_url = `${baseUrl}/api/webhooks/mercado-pago`;
    }
    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": id,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const data = await response.json();
    const production = process.env.MERCADO_PAGO_ENVIRONMENT === "production";
    const initPoint = production
      ? data?.init_point
      : data?.sandbox_init_point || data?.init_point;
    if (!response.ok || typeof initPoint !== "string")
      return NextResponse.json(
        {
          error:
            "O Mercado Pago não criou o checkout. Revise as credenciais de teste.",
        },
        { status: 502 },
      );
    order.paymentStatus = "pending";
    order.updatedAt = new Date().toISOString();
    upsertOrder(order);
    return NextResponse.json(
      { initPoint, preferenceId: data.id, orderId: id },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Carrinho inválido." },
      { status: 400 },
    );
  }
}
