export interface ResearchResult { title: string; url: string; description: string }
export function safeWebUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export function normalizeResults(value: unknown): ResearchResult[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.flatMap(row => {
    if (!row || typeof row !== 'object') return [];
    const url = safeWebUrl(row.url);
    if (!url || seen.has(url) || typeof row.title !== 'string') return [];
    seen.add(url);
    return [{ url, title: row.title.replace(/<[^>]*>/g, '').slice(0, 300), description: typeof row.description === 'string' ? row.description.replace(/<[^>]*>/g, '').slice(0, 1000) : '' }];
  }).slice(0, 10);
}

export function buildResearchLinks(query: string, kind: string) {
  const searchQuery = query + (kind === 'reputation' ? ' avaliações reputação reclamações' : kind === 'suppliers' ? ' fornecedor dropshipping site oficial Brasil' : ' produto preço Brasil');
  return [
    { title: 'Google', url: `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}` },
    { title: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${encodeURIComponent(searchQuery)}` },
    { title: 'Mercado Livre', url: `https://lista.mercadolivre.com.br/${encodeURIComponent(query)}` },
  ];
}
