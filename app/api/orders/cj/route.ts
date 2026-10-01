import { NextRequest, NextResponse } from "next/server";
import { guard, readBody } from "@/lib/server/access";
import { createCjOrder, getCjOrder } from "@/lib/server/cj";
import { getOrder, upsertOrder } from "@/lib/server/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = guard(req, "cj-order");
  if (denied) return denied;
  let orderId = "";
  try {
    const body = await readBody(req);
    orderId = String(body.orderId || "");
    const order = getOrder(orderId);
    if (!order) throw new Error("Pedido não encontrado.");
    if (order.paymentStatus !== "approved")
      throw new Error("O pagamento ainda não foi aprovado.");
    if (order.fulfillmentStatus !== "ready")
      throw new Error("Este pedido já foi processado ou não está pronto.");
    if (
      !order.items.length ||
      order.items.some(
        (item) =>
          item.provider !== "cj" ||
          !item.providerVariantId ||
          !item.providerLogisticName,
      )
    )
      throw new Error(
        "Todos os itens precisam ser variantes CJ com frete escolhido.",
      );
    const logistics = new Set(
      order.items.map((item) => item.providerLogisticName),
    );
    if (logistics.size !== 1)
      throw new Error("Separe itens com métodos logísticos diferentes.");
    const result = await createCjOrder({
      orderNumber: order.externalReference,
      customer: order.customer,
      logisticName: order.items[0].providerLogisticName!,
      products: order.items.map((item, index) => ({
        variantId: item.providerVariantId!,
        quantity: item.quantity,
        lineId: `${order.id}-${index}`,
      })),
    });
    if (!result.orderId) throw new Error("A CJ não devolveu o ID do pedido.");
    order.supplierOrderId = result.orderId;
    order.fulfillmentStatus = "submitted";
    order.updatedAt = new Date().toISOString();
    order.lastError = undefined;
    upsertOrder(order);
    return NextResponse.json({
      ok: true,
      supplierOrderId: result.orderId,
      sandbox: process.env.CJ_ENVIRONMENT !== "production",
    });
  } catch (error) {
    const order = orderId ? getOrder(orderId) : null;
    if (order && order.fulfillmentStatus === "ready") {
      order.lastError =
        error instanceof Error ? error.message : "Falha no envio à CJ.";
      order.updatedAt = new Date().toISOString();
      upsertOrder(order);
    }
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Falha no envio à CJ.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const denied = guard(req, "cj-order-sync");
  if (denied) return denied;
  try {
    const body = await readBody(req);
    const order = getOrder(String(body.orderId || ""));
    if (!order?.supplierOrderId)
      throw new Error("Pedido CJ ainda não foi criado.");
    const remote = await getCjOrder(order.supplierOrderId);
    const status = String(remote.orderStatus || "").toUpperCase();
    order.fulfillmentStatus =
      status === "DELIVERED"
        ? "delivered"
        : status === "SHIPPED"
          ? "shipped"
          : status === "CANCELLED"
            ? "cancelled"
            : "submitted";
    order.trackingNumber = remote.trackNumber || undefined;
    order.trackingProvider = remote.trackingProvider || undefined;
    order.trackingUrl =
      typeof remote.trackingUrl === "string" &&
      remote.trackingUrl.startsWith("https://")
        ? remote.trackingUrl
        : undefined;
    order.updatedAt = new Date().toISOString();
    order.lastError = undefined;
    upsertOrder(order);
    return NextResponse.json({
      ok: true,
      status,
      subStatus: remote.subStatus || null,
      trackingNumber: order.trackingNumber || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha ao sincronizar CJ.",
      },
      { status: 400 },
    );
  }
}
