'use client';
import { useEffect, useState } from 'react';
import { validateBackup } from '@/lib/backup';
import { privateFetch } from '@/lib/client-api';
import { buildResearchLinks } from '@/lib/research';
export function ResearchPanel() {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('products');
  const [token, setToken] = useState('');
  const [links, setLinks] = useState<ReturnType<typeof buildResearchLinks>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [automatic, setAutomatic] = useState(true);
  const [results, setResults] = useState<import('@/lib/research').ResearchResult[]>([]);
  const [retrievedAt, setRetrievedAt] = useState('');
  const [searchSuggestionsHtml, setSearchSuggestionsHtml] = useState('');
  const [notice, setNotice] = useState('');
  useEffect(() => { setToken(sessionStorage.getItem('dropradar_access') || ''); }, []);
  async function search(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError(''); setLinks(buildResearchLinks(query, kind)); setNotice(''); setResults([]); setRetrievedAt(''); setSearchSuggestionsHtml('');
    try {
      const response = await privateFetch('/api/pesquisar', { query, kind, mode: automatic ? 'automatic' : 'direct' }); const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Consulta indisponível.');
      setLinks(data.links); setNotice(data.notice); setResults(data.results || []); setRetrievedAt(data.retrievedAt || ''); setSearchSuggestionsHtml(data.searchSuggestionsHtml || '');
    } catch (err) { setError(err instanceof Error ? err.message : 'Falha na consulta.'); }
    finally { setLoading(false); }
  }
  function backup() {
    const content: Record<string, unknown> = { version: 2, exportedAt: new Date().toISOString() };
    for (const key of ['dropradar_products_v2', 'dropradar_suppliers_v2', 'dropradar_checklist_v1']) content[key] = JSON.parse(localStorage.getItem(key) || '[]');
    const url = URL.createObjectURL(new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'dropradar-backup.json'; a.click(); URL.revokeObjectURL(url);
  }
  async function restore(file?: File) {
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('Backup excede 5 MB.');
      const data = validateBackup(JSON.parse(await file.text()));
      // Save previous state before overwriting, for rollback on storage failures.
      const previous = Object.fromEntries(Object.keys(data).map(k => [k, localStorage.getItem(k)]));
      try { for (const [key, rows] of Object.entries(data)) localStorage.setItem(key, JSON.stringify(rows)); }
      catch (err) { for (const [key, value] of Object.entries(previous)) { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, value); } throw err; }
      window.location.reload();
    } catch (err) { setError(err instanceof Error ? err.message : 'Não foi possível restaurar o backup.'); }
  }
  return <section className="mb-8 rounded-2xl border border-emerald-800 bg-slate-900 p-5 space-y-4">
    <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">Pesquisa em fontes reais</h2><p className="text-sm text-slate-400 mt-1">Pesquisa direta sem chave. Busca automática com Gemini 2.5 Flash e Google Search; confira os dados nas fontes.</p></div><button type="button" onClick={backup} className="text-sm border border-slate-700 rounded-lg px-3 py-2">Baixar backup pessoal</button></div>
    <label className="block text-xs text-slate-400">Restaurar backup (substitui os cadastros deste navegador; baixe uma cópia antes)<input type="file" accept="application/json,.json" onChange={e => void restore(e.target.files?.[0])} className="block mt-1" /></label>
    <details><summary className="cursor-pointer text-sm text-emerald-300">Acesso às APIs opcionais</summary><label className="block mt-2 text-sm">Token pessoal (se configurado no servidor)<input type="password" autoComplete="off" value={token} onChange={e => { setToken(e.target.value); sessionStorage.setItem('dropradar_access', e.target.value); }} className="block bg-slate-950 border border-slate-700 rounded-lg p-2 w-full mt-1" /></label><p className="text-xs text-slate-400 mt-1">A pesquisa direta não exige token. A busca Gemini e o gerador exigem o token pessoal do servidor. A mesma GEMINI_API_KEY fica apenas em .env.local; nunca cole a chave aqui.</p></details>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={automatic} onChange={e => { setAutomatic(e.target.checked); setResults([]); setRetrievedAt(''); setSearchSuggestionsHtml(''); }} />Buscar com Gemini 2.5 Flash + Google Search (usa a chave já cadastrada)</label>
    <form onSubmit={search} className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="research-kind">Tipo de pesquisa</label><select id="research-kind" value={kind} onChange={e => { setKind(e.target.value); setLinks([]); setNotice(''); setResults([]); setRetrievedAt(''); setSearchSuggestionsHtml(''); }} className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2"><option value="products">Produtos</option><option value="suppliers">Fornecedores</option></select><label className="sr-only" htmlFor="research-query">Termo de busca</label><input id="research-query" required maxLength={200} value={query} onChange={e => { setQuery(e.target.value); setLinks([]); setNotice(''); setResults([]); setRetrievedAt(''); setSearchSuggestionsHtml(''); }} placeholder="Ex.: camiseta sob demanda, acessórios pet…" className="flex-1 min-w-48 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2" /><button disabled={loading} className="bg-emerald-600 disabled:opacity-50 rounded-lg px-4 py-2">{loading ? 'Consultando…' : automatic ? 'Buscar com Gemini' : 'Preparar pesquisa gratuita'}</button></form>
    {error && <p role="alert" className="text-amber-300 text-sm">{error}</p>}
    {retrievedAt && <p className="text-xs text-slate-400">Gemini 2.5 Flash + Google Search • Consultado em {new Date(retrievedAt).toLocaleString('pt-BR')} • {results.length} resultados</p>}
    <div className="grid md:grid-cols-2 gap-3">{results.map(result => <article key={result.url} className="p-4 rounded-xl border border-slate-700 bg-slate-950"><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-emerald-300 font-medium">{result.title}</a><p className="text-xs text-slate-500 break-all mt-1">{result.url}</p><p className="text-sm text-slate-300 mt-2">{result.description}</p></article>)}</div>
    {searchSuggestionsHtml && <iframe title="Sugestões de pesquisa do Google" srcDoc={searchSuggestionsHtml} sandbox="allow-popups allow-popups-to-escape-sandbox" referrerPolicy="no-referrer" className="w-full h-40 rounded-lg border border-slate-700 bg-white" />}
    {notice && <p className="text-sm text-slate-400">{notice}</p>}
    <div className="flex flex-wrap gap-3">{links.map(link => <a key={link.title} href={link.url} target="_blank" rel="noopener noreferrer" className="rounded-lg border border-emerald-700 px-4 py-3 text-emerald-300">Pesquisar no {link.title} ↗</a>)}</div>
    <p className="text-xs text-slate-400">Após confirmar uma cotação, use + Produto ou + Fornecedor e registre a URL de origem. Preço, estoque, frete e condições precisam ser confirmados no site do vendedor.</p>
  </section>;
}
