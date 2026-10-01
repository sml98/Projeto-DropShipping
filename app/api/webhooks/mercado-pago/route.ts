import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getOrder,
  getOrderByPaymentId,
  recordWebhook,
  upsertOrder,
} from "@/lib/server/db";
import type { CommerceOrder } from "@/lib/commerce-types";

export const runtime = "nodejs";

function validSignature(req: NextRequest, dataId: string) {
  const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;
  if (!secret) return process.env.MERCADO_PAGO_ENVIRONMENT !== "production";
  const signature = req.headers.get("x-signature") || "";
  const requestId = req.headers.get("x-request-id") || "";
  const parts = Object.fromEntries(
    signature.split(",").map((part) => part.trim().split("=")),
  );
  if (!parts.ts || !parts.v1 || !requestId) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");
  const a = Buffer.from(parts.v1);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function paymentStatus(status: string): CommerceOrder["paymentStatus"] {
  if (status === "approved") return "approved";
  if (status === "refunded" || status === "charged_back") return "refunded";
  if (status === "cancelled") return "cancelled";
  if (status === "rejected") return "rejected";
  return "pending";
}

export async function POST(req: NextRequest) {
  try {
    const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    if (!token) return NextResponse.json({ received: false }, { status: 503 });
    const body = await req.json().catch(() => ({}));
    const candidate = req.nextUrl.searchParams.get("data.id") || body?.data?.id;
    if (typeof candidate !== "string" && typeof candidate !== "number")
      return NextResponse.json({ received: true });
    const paymentId = String(candidate);
    if (!/^\d{1,32}$/.test(paymentId) || !validSignature(req, paymentId))
      return NextResponse.json({ received: false }, { status: 401 });
    if (
      !recordWebhook(
        "mercado-pago",
        `${paymentId}:${body?.action || body?.type || "payment"}`,
        body,
      )
    )
      return NextResponse.json({ received: true, duplicate: true });
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      },
    );
    if (!response.ok)
      return NextResponse.json({ received: false }, { status: 502 });
    const payment = await response.json();
    const order =
      getOrder(String(payment.external_reference || "")) ||
      getOrderByPaymentId(paymentId);
    if (!order) return NextResponse.json({ received: true, unmatched: true });
    order.paymentId = paymentId;
    order.paymentStatus = paymentStatus(String(payment.status || ""));
    order.fulfillmentStatus =
      order.paymentStatus === "approved" ? "ready" : order.fulfillmentStatus;
    order.updatedAt = new Date().toISOString();
    upsertOrder(order);
    return NextResponse.json(
      {
        received: true,
        paymentId,
        orderId: order.id,
        status: order.paymentStatus,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ received: false }, { status: 400 });
  }
}
