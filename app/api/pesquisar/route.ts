import { NextRequest, NextResponse } from 'next/server';
import { field, guard, readBody } from '@/lib/server/access';
import { buildResearchLinks } from '@/lib/research';
import { searchTavily } from '@/lib/tavily';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  try {
    const body = await readBody(req);
    const query = field(body, 'query', true, 200);
    const kind = field(body, 'kind', true, 30);
    if (!['products', 'suppliers'].includes(kind)) throw new Error('Tipo inválido.');
    const mode = field(body, 'mode', false, 20) || 'direct';
    if (!['direct', 'automatic'].includes(mode)) throw new Error('Modo inválido.');
    if (mode === 'automatic') {
      const denied = guard(req, 'research'); if (denied) return denied;
      const key = process.env.TAVILY_API_KEY;
      if (!key) return NextResponse.json({ error: 'Cadastre-se no plano gratuito da Tavily e configure TAVILY_API_KEY no servidor. A pesquisa direta funciona sem chave.' }, { status: 503 });
      try {
        const results = await searchTavily(query, kind, key);
        return NextResponse.json({ results, mode, provider: 'Tavily', retrievedAt: new Date().toISOString(), links: buildResearchLinks(query, kind), notice: 'Resultados de pesquisa da Tavily. Confira preço, estoque e condições na fonte. Isso não certifica fornecedores nem mede vendas.' }, { headers: { 'Cache-Control': 'no-store' } });
      } catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : 'Consulta indisponível.' }, { status: 502 }); }
    }
    return NextResponse.json({ links: buildResearchLinks(query, kind), mode: 'direct', notice: 'Abra uma fonte para consultar resultados reais. Este aplicativo não importa resultados, preços ou estoque automaticamente.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Informe uma busca de até 200 caracteres e um tipo válido.' }, { status: 400 }); }
}
