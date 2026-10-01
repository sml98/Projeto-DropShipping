import { NextRequest, NextResponse } from "next/server";
import { field, guard, readBody } from "@/lib/server/access";
import { buildResearchLinks } from "@/lib/research";
import { searchTavily, SearchError } from "@/lib/tavily-search";
import { researchOpportunity } from "@/lib/opportunity-search";
export const runtime = "nodejs";
export async function POST(req: NextRequest) {
  try {
    const body = await readBody(req);
    const query = field(body, "query", true, 200);
    const kind = field(body, "kind", true, 30);
    if (
      !["products", "suppliers", "reputation", "opportunities"].includes(kind)
    )
      throw new Error("Tipo inválido.");
    const mode = field(body, "mode", false, 20) || "direct";
    if (!["direct", "automatic"].includes(mode))
      throw new Error("Modo inválido.");
    if (mode === "automatic") {
      const denied = guard(req, "research");
      if (denied) return denied;
      const key = process.env.TAVILY_API_KEY;
      if (!key)
        return NextResponse.json(
          {
            error:
              "Configure TAVILY_API_KEY em .env.local com sua chave gratuita da Tavily e reinicie o servidor.",
          },
          { status: 503 },
        );
      try {
        if (kind === "opportunities") {
          const report = await researchOpportunity(query, key);
          return NextResponse.json(
            {
              report,
              links: buildResearchLinks(query, "products"),
              mode,
              provider: "Tavily",
              retrievedAt: report.retrievedAt,
              notice:
                "Análise de fontes públicas. Preços podem ser de variações, kits ou promoções; confirme o mesmo produto antes de comparar.",
            },
            { headers: { "Cache-Control": "no-store" } },
          );
        }
        const sources = await searchTavily(query, kind, key);
        return NextResponse.json(
          {
            ...sources,
            mode,
            provider: "Tavily",
            retrievedAt: new Date().toISOString(),
            links: buildResearchLinks(query, kind),
            notice:
              kind === "reputation"
                ? "Trechos de páginas de reputação encontrados para o nome informado. Confira se pertencem à mesma empresa e o período das avaliações. Não há nota verificada nem certificação automática."
                : "Resultados encontrados pela Tavily. Confira preço, estoque e condições na fonte. Aparecer na busca não confirma que a empresa oferece dropshipping ou é confiável.",
          },
          { headers: { "Cache-Control": "no-store" } },
        );
      } catch (err) {
        return NextResponse.json(
          {
            error: `${err instanceof SearchError ? err.message : "Resposta de busca inválida."} Nenhum resultado foi simulado.`,
          },
          { status: err instanceof SearchError ? err.status : 502 },
        );
      }
    }
    return NextResponse.json(
      {
        links: buildResearchLinks(query, kind),
        mode: "direct",
        notice:
          "Abra uma fonte para consultar resultados reais. Este aplicativo não importa resultados, preços ou estoque automaticamente.",
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Informe uma busca de até 200 caracteres e um tipo válido." },
      { status: 400 },
    );
  }
}
