import { getExchangeRates, type Currency } from './exchange-rates.ts';
import { searchTavily, SearchError } from './tavily-search.ts';
import { analyzeSource, type ResearchGroup, type ResearchReport } from './research-report.ts';

export async function researchOpportunity(query: string, key: string, request: typeof fetch = fetch): Promise<ResearchReport> {
  const groups: ResearchGroup[] = ['suppliers', 'products', 'demand'];
  const responses = await Promise.allSettled(groups.map(group => searchTavily(query, group, key, request)));
  const sources = responses.flatMap((result, i) => result.status === 'fulfilled' ? result.value.results.slice(0, 6).map(source => analyzeSource(source, groups[i])) : []);
  const warnings = responses.flatMap((result, i) => result.status === 'rejected' ? [`${groups[i] === 'suppliers' ? 'Fornecedores' : groups[i] === 'products' ? 'Produtos' : 'Indícios de vendas'}: ${result.reason instanceof SearchError ? result.reason.message : 'Consulta indisponível.'}`] : []);
  if (responses.every(result => result.status === 'rejected')) {
    const failure = responses[0];
    throw failure.status === 'rejected' && failure.reason instanceof SearchError ? failure.reason : new SearchError('Não foi possível pesquisar este produto.');
  }
  // Read at most five actual result URLs; never accept a URL supplied separately by the client.
  const selected = [...sources.filter(s => s.group === 'suppliers' && !s.guide).slice(0, 2), ...sources.filter(s => s.group === 'products').slice(0, 2), ...sources.filter(s => s.group === 'demand').slice(0, 1)];
  const urls = [...new Set(selected.map(s => s.url))];
  const quotaBlocked = responses.some(result => result.status === 'rejected' && result.reason instanceof SearchError && [429, 503].includes(result.reason.status));
  const extractionAttempted = urls.length > 0 && !quotaBlocked;
  if (extractionAttempted) {
    try {
      const response = await request('https://api.tavily.com/extract', {
        method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, extract_depth: 'basic', format: 'text', include_images: false }),
        signal: AbortSignal.timeout(30000), cache: 'no-store', redirect: 'error',
      });
      if (!response.ok) throw new Error('Extraction unavailable');
      const data = await response.json();
      if (!Array.isArray(data.results)) throw new Error('Invalid extraction');
      for (const row of data.results) {
        if (!row || !urls.includes(row.url) || typeof row.raw_content !== 'string') continue;
        for (let i = 0; i < sources.length; i++) if (sources[i].url === row.url) sources[i] = analyzeSource(sources[i], sources[i].group, row.raw_content);
      }
      const unread = urls.filter(url => !sources.some(s => s.url === url && s.extracted));
      if (unread.length) warnings.push(`${unread.length} página(s) não puderam ser lidas; os respectivos dados vêm apenas do trecho de busca.`);
    } catch { warnings.push('A leitura das páginas falhou. A análise disponível usa apenas os trechos da busca.'); }
  }
  const domains = [...new Set(sources.filter(s => s.group === 'suppliers' && !s.guide && s.commercialEvidence.length > 0).map(s => s.domain))].slice(0, 3);
  const [exchange, reputations] = await Promise.all([
    getExchangeRates(sources.flatMap(s => s.prices.filter(p => p.currency !== 'UNKNOWN').map(p => p.currency as Currency)), request),
    Promise.all(domains.map(async domain => {
      if (quotaBlocked) return { domain, results: [], error: 'Consulta de reputação não executada por limite do provedor.' };
      try { return { domain, results: (await searchTavily(domain, 'reputation', key, request)).results }; }
      catch (err) { return { domain, results: [], error: err instanceof SearchError ? err.message : 'Reputação indisponível.' }; }
    })),
  ]);
  for (const source of sources) for (const price of source.prices) {
    const rate = exchange.rates.find(r => r.currency === price.currency);
    if (rate) { price.conversion = rate; price.brlValue = Math.round(price.value * rate.rate * 100) / 100; }
  }
  if (exchange.missing.length) warnings.push(`Sem cotação recente para ${exchange.missing.join(', ')}; esses preços não foram convertidos nem usados no cálculo.`);
  if (sources.some(s => s.prices.some(p => p.currency === 'UNKNOWN'))) warnings.push('Símbolos $ e ¥ sem código de moeda são ambíguos. Esses valores não são tratados como reais nem usados no cálculo.');
  return { query, sources, warnings, retrievedAt: new Date().toISOString(), searchCalls: 3 + (quotaBlocked ? 0 : domains.length), extractionAttempted, reputationChecks: reputations };
}
