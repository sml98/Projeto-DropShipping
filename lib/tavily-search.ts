import { normalizeResults } from './research.ts';

export class SearchError extends Error {
  constructor(message: string, public status = 502) { super(message); }
}
export function tavilyRequest(query: string, kind: string) {
  return {
    query: query + (kind === 'reputation' ? ' avaliações reputação reclamações' : kind === 'suppliers' ? ' fornecedor dropshipping site oficial Brasil' : ' produto preço Brasil'),
    search_depth: 'basic', auto_parameters: false, topic: 'general', max_results: 10,
    include_answer: false, include_raw_content: false, include_images: false,
    ...(kind === 'reputation' ? { include_domains: ['reclameaqui.com.br', 'trustpilot.com', 'mercadolivre.com.br'] } : {}),
  };
}
export async function searchTavily(query: string, kind: string, key: string, request: typeof fetch = fetch) {
  let response: Response;
  try {
    response = await request('https://api.tavily.com/search', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(tavilyRequest(query, kind)), signal: AbortSignal.timeout(30000), cache: 'no-store', redirect: 'error',
    });
  } catch { throw new SearchError('Não foi possível conectar à Tavily em até 30 segundos. Tente novamente.'); }
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new SearchError('A Tavily recusou a chave. Confira TAVILY_API_KEY no servidor.', 503);
    if ([429, 432, 433].includes(response.status)) throw new SearchError('Limite ou créditos da Tavily atingidos. Confira o painel; não é necessário ativar um plano pago.', 429);
    throw new SearchError(`A Tavily não concluiu a consulta (HTTP ${response.status}).`);
  }
  let data;
  try { data = await response.json(); } catch { throw new SearchError('A Tavily retornou uma resposta inválida.'); }
  if (!data || !Array.isArray(data.results)) throw new SearchError('A Tavily retornou uma resposta sem lista de fontes.');
  const results = normalizeResults(data.results.map((row: {title?: unknown; url?: unknown; content?: unknown} | null) => ({ title: row?.title, url: row?.url, description: row?.content })));
  return { results: kind === 'reputation' ? results.filter(row => {
    const host = new URL(row.url).hostname;
    return ['reclameaqui.com.br', 'trustpilot.com', 'mercadolivre.com.br'].some(domain => host === domain || host.endsWith('.' + domain));
  }) : results };
}
