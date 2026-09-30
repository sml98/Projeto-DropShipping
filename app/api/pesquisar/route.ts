import { NextRequest, NextResponse } from 'next/server';
import { field, guard, readBody } from '@/lib/server/access';
import { buildResearchLinks } from '@/lib/research';
import { searchGemini, GEMINI_MODEL } from '@/lib/gemini-search';
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
      const key = process.env.GEMINI_API_KEY;
      if (!key || key === 'MY_GEMINI_API_KEY') return NextResponse.json({ error: 'Configure GEMINI_API_KEY no servidor. A pesquisa usa a mesma chave do gerador; nenhuma chave de busca adicional é necessária.' }, { status: 503 });
      try {
        const grounded = await searchGemini(query, kind, key);
        return NextResponse.json({ ...grounded, mode, provider: 'Gemini 2.5 Flash + Google Search', model: GEMINI_MODEL, retrievedAt: new Date().toISOString(), links: buildResearchLinks(query, kind), notice: 'Fontes retornadas pelo Google Search via Gemini 2.5 Flash. Links podem redirecionar pelo Google. Confira preço, estoque e condições na fonte. Isso não certifica fornecedores nem mede vendas.' }, { headers: { 'Cache-Control': 'no-store' } });
      } catch (err) {
        const status = err && typeof err === 'object' && 'status' in err ? err.status : undefined;
        const error = status === 429 ? 'Cota ou limite do Gemini atingido. Aguarde a renovação ou use os links de pesquisa direta.' : status === 401 || status === 403 ? 'O Gemini recusou o acesso. Confira a GEMINI_API_KEY e as permissões do projeto.' : err instanceof Error && err.message.startsWith('O Gemini não retornou') ? err.message : 'A busca Gemini falhou ou excedeu o tempo limite. Confira a chave e a quota; nenhum resultado foi simulado.';
        return NextResponse.json({ error }, { status: status === 429 ? 429 : 502 });
      }
    }
    return NextResponse.json({ links: buildResearchLinks(query, kind), mode: 'direct', notice: 'Abra uma fonte para consultar resultados reais. Este aplicativo não importa resultados, preços ou estoque automaticamente.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Informe uma busca de até 200 caracteres e um tipo válido.' }, { status: 400 }); }
}
