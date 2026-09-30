import { NextRequest, NextResponse } from 'next/server';
import { field, guard, readBody } from '@/lib/server/access';
import { normalizeResults } from '@/lib/research';
export const runtime = 'nodejs';
export async function POST(req: NextRequest) {
  const denied = guard(req, 'research'); if (denied) return denied;
  let query: string; let kind: string;
  try {
    const body = await readBody(req); query = field(body, 'query', true, 200); kind = field(body, 'kind', true, 30);
    if (!['products', 'suppliers'].includes(kind)) throw new Error('Tipo de busca inválido.');
  } catch { return NextResponse.json({ error: 'Informe uma busca de até 200 caracteres e um tipo válido.' }, { status: 400 }); }
  const key = process.env.BRAVE_SEARCH_API_KEY;
  if (!key) return NextResponse.json({ error: 'Busca automática não configurada. Adicione BRAVE_SEARCH_API_KEY ao servidor. Os links de pesquisa direta abaixo continuam disponíveis.' }, { status: 503 });
  const searchQuery = kind === 'suppliers' ? `${query} fornecedor dropshipping site oficial Brasil` : `${query} produto preço Brasil`;
  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.search = new URLSearchParams({ q: searchQuery, country: 'BR', search_lang: 'pt-br', count: '10', safesearch: 'moderate' }).toString();
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json', 'X-Subscription-Token': key }, signal: AbortSignal.timeout(15000), cache: 'no-store' });
    if (!response.ok) return NextResponse.json({ error: response.status === 429 ? 'Quota da API de busca atingida.' : 'O provedor recusou a consulta. Verifique a chave e o plano de busca.' }, { status: response.status === 429 ? 429 : 502 });
    const payload = await response.json();
    return NextResponse.json({ results: normalizeResults(payload.web?.results), query: searchQuery, retrievedAt: new Date().toISOString(), provider: 'Brave Search', notice: 'Trechos do índice de busca. Consulte a página original e confirme preço, estoque e condições; um resultado não é uma recomendação nem auditoria do fornecedor.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Falha ou timeout na busca. Nenhum resultado foi simulado.' }, { status: 502 }); }
}
