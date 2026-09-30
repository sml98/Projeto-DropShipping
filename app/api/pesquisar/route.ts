import { NextRequest, NextResponse } from 'next/server';
import { field, guard, readBody } from '@/lib/server/access';
import { buildResearchLinks } from '@/lib/research';
import { searchGemini, GEMINI_MODEL } from '@/lib/gemini-search';
import { diagnoseGeminiError } from '@/lib/gemini-error';
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
        return NextResponse.json({ ...grounded, mode, provider: 'Gemini 3.5 Flash + Google Search', model: GEMINI_MODEL, retrievedAt: new Date().toISOString(), links: buildResearchLinks(query, kind), notice: 'Fontes retornadas pelo Google Search via Gemini 3.5 Flash. Links podem redirecionar pelo Google. Confira preço, estoque e condições na fonte. Isso não certifica fornecedores nem mede vendas.' }, { headers: { 'Cache-Control': 'no-store' } });
      } catch (err) {
        const diagnosis = diagnoseGeminiError(err, [key, process.env.APP_ACCESS_TOKEN || '']);
        return NextResponse.json({ error: `${diagnosis.message} Nenhum resultado foi simulado.`, diagnostic: { category: diagnosis.category, providerStatus: diagnosis.providerStatus, detail: diagnosis.detail } }, { status: diagnosis.httpStatus });
      }
    }
    return NextResponse.json({ links: buildResearchLinks(query, kind), mode: 'direct', notice: 'Abra uma fonte para consultar resultados reais. Este aplicativo não importa resultados, preços ou estoque automaticamente.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Informe uma busca de até 200 caracteres e um tipo válido.' }, { status: 400 }); }
}
