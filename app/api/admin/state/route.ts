import { NextRequest, NextResponse } from "next/server";
import { guard, readBody } from "@/lib/server/access";
import {
  clearDemoData,
  deleteEntity,
  listEntities,
  listOrders,
  loadDemoData,
  upsertEntity,
} from "@/lib/server/db";
import {
  validateCreative,
  validateProduct,
  validateSupplier,
} from "@/lib/server/commerce-validation";
import type {
  CommerceProduct,
  CommerceSupplier,
  CreativeDraft,
  IntegrationStatus,
} from "@/lib/commerce-types";
import { getNuvemshopConnection } from "@/lib/server/nuvemshop";
import { getTikTokConnection } from "@/lib/server/tiktok";
import { analyzeOpportunity } from "@/lib/opportunity-engine";

export const runtime = "nodejs";

function integrationStatus(): IntegrationStatus[] {
  const nuvemshop = getNuvemshopConnection();
  const tiktok = getTikTokConnection();
  return [
    {
      key: "tavily",
      name: "Tavily",
      configured: Boolean(process.env.TAVILY_API_KEY),
      connected: Boolean(process.env.TAVILY_API_KEY),
      detail: "Pesquisa pública de oportunidades",
      requiresUser: process.env.TAVILY_API_KEY
        ? []
        : ["Criar uma chave Tavily"],
    },
    {
      key: "gemini",
      name: "Gemini",
      configured: Boolean(process.env.GEMINI_API_KEY),
      connected: Boolean(process.env.GEMINI_API_KEY),
      detail: "Rascunhos de ofertas e criativos",
      requiresUser: process.env.GEMINI_API_KEY
        ? []
        : ["Criar uma chave no Google AI Studio"],
    },
    {
      key: "cj",
      name: "CJdropshipping",
      configured: Boolean(
        process.env.CJ_API_KEY || process.env.CJ_ACCESS_TOKEN,
      ),
      connected: Boolean(process.env.CJ_API_KEY || process.env.CJ_ACCESS_TOKEN),
      detail: "Pesquisa, variantes, estoque e logística",
      requiresUser:
        process.env.CJ_API_KEY || process.env.CJ_ACCESS_TOKEN
          ? []
          : ["Instalar o app API da CJ e copiar a API Key"],
    },
    {
      key: "nuvemshop",
      name: "Nuvemshop",
      configured: Boolean(
        nuvemshop ||
          (process.env.NUVEMSHOP_CLIENT_ID &&
            process.env.NUVEMSHOP_CLIENT_SECRET),
      ),
      connected: Boolean(nuvemshop),
      detail: "Catálogo por API e OAuth",
      requiresUser: nuvemshop
        ? []
        : ["Criar o app no portal de parceiros", "Autorizar sua loja"],
    },
    {
      key: "mercado-pago",
      name: "Mercado Pago",
      configured: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
      connected: Boolean(process.env.MERCADO_PAGO_ACCESS_TOKEN),
      detail: "Checkout e confirmação de pagamentos",
      requiresUser: process.env.MERCADO_PAGO_ACCESS_TOKEN
        ? []
        : ["Criar uma aplicação e copiar o token de teste"],
    },
    {
      key: "tiktok",
      name: "TikTok",
      configured: Boolean(
        process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET,
      ),
      connected: Boolean(tiktok),
      detail: "OAuth pronto; publicação exige domínio e app aprovados",
      requiresUser: tiktok
        ? []
        : ["Criar/submeter o app e autorizar sua conta TikTok"],
    },
  ];
}

export async function GET(req: NextRequest) {
  const denied = guard(req, "admin-state");
  if (denied) return denied;
  return NextResponse.json(
    {
      products: listEntities<CommerceProduct>("products"),
      suppliers: listEntities<CommerceSupplier>("suppliers"),
      creatives: listEntities<CreativeDraft>("creatives"),
      orders: listOrders(),
      integrations: integrationStatus(),
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(req: NextRequest) {
  const denied = guard(req, "admin-write");
  if (denied) return denied;
  try {
    const body = await readBody(req);
    const action = String(body.action || "");
    if (action === "upsertProduct") {
      const product = validateProduct(body.value);
      if (["approved", "published"].includes(product.status)) {
        const analysis = analyzeOpportunity(
          product,
          listEntities<CommerceSupplier>("suppliers"),
        );
        if (analysis.blockers.length)
          throw new Error(`Aprovação bloqueada: ${analysis.blockers[0]}`);
      }
      upsertEntity("products", product);
    } else if (action === "upsertSupplier")
      upsertEntity("suppliers", validateSupplier(body.value));
    else if (action === "upsertCreative")
      upsertEntity("creatives", validateCreative(body.value));
    else if (action === "deleteProduct")
      deleteEntity("products", String(body.id || ""));
    else if (action === "deleteSupplier")
      deleteEntity("suppliers", String(body.id || ""));
    else if (action === "deleteCreative")
      deleteEntity("creatives", String(body.id || ""));
    else if (action === "loadDemo") loadDemoData();
    else if (action === "clearDemo") clearDemoData();
    else throw new Error("Ação inválida.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dados inválidos." },
      { status: 400 },
    );
  }
}
