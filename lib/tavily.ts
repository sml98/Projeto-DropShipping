import { normalizeResults } from './research.ts';
export function tavilySearchBody(query: string, kind: string) {
  return { query: query + (kind === 'suppliers' ? ' fornecedor dropshipping site oficial Brasil' : ' produto preço Brasil'), search_depth: 'basic', auto_parameters: false, topic: 'general', max_results: 10, include_answer: false, include_raw_content: false, include_images: false };
}
export async function searchTavily(query: string, kind: string, key: string, request: typeof fetch = fetch) {
  const response = await request('https://api.tavily.com/search', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }, body: JSON.stringify(tavilySearchBody(query, kind)), signal: AbortSignal.timeout(15000), cache: 'no-store', redirect: 'error' });
  if (!response.ok) {
    if ([429, 432, 433].includes(response.status)) throw new Error('Cota ou limite da Tavily atingido. Use a pesquisa direta gratuita; não é necessário contratar um plano.');
    throw new Error('A Tavily recusou a consulta. Confira sua chave ou use a pesquisa direta gratuita.');
  }
  const payload = await response.json();
  if (!Array.isArray(payload.results)) throw new Error('A Tavily não retornou uma lista válida.');
  return normalizeResults(payload.results.map((row: Record<string, unknown> | null) => ({ title: row?.title, url: row?.url, description: row?.content })));
}
