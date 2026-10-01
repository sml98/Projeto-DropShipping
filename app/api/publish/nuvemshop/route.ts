import { NextRequest, NextResponse } from "next/server";
import { guard, readBody } from "@/lib/server/access";
import {
  getNuvemshopConnection,
  nuvemshopHeaders,
} from "@/lib/server/nuvemshop";
import { getEntity, listEntities } from "@/lib/server/db";
import { analyzeOpportunity } from "@/lib/opportunity-engine";
import type { CommerceProduct, CommerceSupplier } from "@/lib/commerce-types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = guard(req, "nuvemshop-publish");
  if (denied) return denied;
  try {
    const connection = getNuvemshopConnection();
    if (!connection)
      return NextResponse.json(
        { error: "Autorize a Nuvemshop na seção Integrações." },
        { status: 503 },
      );
    const { storeId, accessToken } = connection;
    const body = await readBody(req);
    const requested = body.product;
    if (!requested || typeof requested !== "object" || Array.isArray(requested))
      throw new Error("Produto inválido.");
    const requestedId = String((requested as Record<string, unknown>).id || "");
    const row = getEntity<CommerceProduct>("products", requestedId);
    if (!row || !["approved", "published"].includes(row.status))
      throw new Error("Produto ainda não foi aprovado.");
    const analysis = analyzeOpportunity(
      row,
      listEntities<CommerceSupplier>("suppliers"),
    );
    if (analysis.blockers.length) throw new Error(analysis.blockers[0]);
    const name = row.name.trim().slice(0, 160);
    const summary = row.summary.trim().slice(0, 2000);
    const imageUrl = /^https:\/\//.test(row.imageUrl) ? row.imageUrl : "";
    const price = Number(row.targetPrice);
    if (!name || !Number.isFinite(price) || price <= 0 || !imageUrl)
      throw new Error("Campos obrigatórios ausentes.");
    const response = await fetch(
      `https://api.nuvemshop.com.br/2025-03/${encodeURIComponent(storeId)}/products`,
      {
        method: "POST",
        headers: nuvemshopHeaders(accessToken),
        body: JSON.stringify({
          name: { pt: name },
          description: { pt: summary },
          published: true,
          variants: [{ price: price.toFixed(2), stock_management: false }],
          images: [{ src: imageUrl }],
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const data = await response.json();
    if (!response.ok || !data?.id)
      return NextResponse.json(
        {
          error:
            "A Nuvemshop recusou a publicação. Confira credenciais, versão da API e dados do produto.",
        },
        { status: 502 },
      );
    return NextResponse.json(
      { productId: data.id, adminUrl: data.admin_url || null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Produto inválido para publicação.",
      },
      { status: 400 },
    );
  }
}
