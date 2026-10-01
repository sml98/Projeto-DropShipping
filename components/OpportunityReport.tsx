'use client';
import { useState } from 'react';
import type { Product, Supplier } from '@/types';
import type { ResearchReport, SourceAnalysis } from '@/lib/research-report';
import { formatCurrencyBRL } from '@/lib/calculator';

interface Props {
  report: ResearchReport;
  onPrepareProduct: (draft: Partial<Product>) => void;
  onPrepareSupplier: (draft: Partial<Supplier>) => void;
}
export function OpportunityReport({ report, onPrepareProduct, onPrepareSupplier }: Props) {
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [costSource, setCostSource] = useState('');
  const [priceSource, setPriceSource] = useState('');
  const [freight, setFreight] = useState('0');
  const [other, setOther] = useState('0');
  const [fee, setFee] = useState('0');
  const [confirmed, setConfirmed] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const parse = (v: string) => Number(v.replace(',', '.'));
  const valid = cost.trim() !== '' && price.trim() !== '' && [cost, price, freight, other, fee].every(v => v.trim() !== '' && Number.isFinite(parse(v)) && parse(v) >= 0) && parse(price) > 0 && parse(fee) <= 100;
  const profit = valid ? parse(price) - parse(cost) - parse(freight) - parse(other) - parse(price) * parse(fee) / 100 : null;
  const margin = profit === null ? null : profit / parse(price) * 100;
  const groups = [
    { key: 'suppliers', title: 'Candidatos a fornecedor', subtitle: 'Páginas encontradas para fabricante, distribuidor, atacado e dropshipping. Condições ainda precisam ser confirmadas.' },
    { key: 'products', title: 'Produtos e preços de mercado', subtitle: 'Preços citados nas fontes. Não presumimos que sejam o mesmo modelo, tamanho, kit ou quantidade.' },
    { key: 'demand', title: 'Indícios de vendas', subtitle: 'Menções de vendas e listas de mais vendidos. Não constituem um ranking auditado ou vendas mensais.' },
  ];
  function draftSupplier(source: SourceAnalysis) {
    onPrepareSupplier({ name: source.title, catalogUrl: source.url, sourceUrl: source.url, description: source.commercialEvidence.join('\n') || source.description, category: report.query });
  }
  function exportReport() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pesquisa-dropshipping.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-semibold">Análise: {report.query}</h3><p className="text-xs text-slate-400">{new Date(report.retrievedAt).toLocaleString('pt-BR')} • {report.sources.filter(s => s.extracted).length} páginas lidas • {report.sources.filter(s => s.prices.length).length} fontes com preços</p></div><button type="button" onClick={exportReport} className="border border-slate-600 rounded-lg px-3 py-2 text-sm">Baixar análise com fontes</button></div>
    {report.warnings.map((warning, i) => <p key={i} role="status" className="text-sm text-amber-300">{warning}</p>)}
    <section className="rounded-xl bg-emerald-950/30 border border-emerald-800 p-4 space-y-3">
      <h4 className="font-semibold">Comparar custo e preço de venda</h4>
      <p className="text-xs text-slate-400">Use os botões de preço abaixo para preencher a comparação ou informe sua cotação. Frete, taxas, impostos e anúncios devem entrar nos custos. Valores zerados deixam esses custos fora da simulação.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">{[
        { label: 'Custo unitário (R$)', value: cost, set: (v: string) => { setCost(v); setCostSource(''); setConfirmed(false); } },
        { label: 'Preço de venda (R$)', value: price, set: (v: string) => { setPrice(v); setPriceSource(''); setConfirmed(false); } },
        { label: 'Frete por pedido (R$)', value: freight, set: setFreight },
        { label: 'Outros custos por pedido (R$)', value: other, set: setOther },
        { label: 'Taxas sobre venda (%)', value: fee, set: setFee },
      ].map(input => <label key={input.label} className="text-xs text-slate-300">{input.label}<input type="number" min="0" step="0.01" value={input.value} onChange={e => input.set(e.target.value)} className="block w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-lg" /></label>)}</div>
      <p className="text-xs text-slate-400">Outros custos: impostos fixos, anúncios/CPA, embalagem, taxas fixas e operação. Taxas percentuais: gateway, marketplace e tributos sobre venda.</p>
      {costSource && <p className="text-xs break-all">Fonte do custo selecionado: {costSource}</p>}{priceSource && <p className="text-xs break-all">Fonte do preço selecionado: {priceSource}</p>}
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confirmei o mesmo produto, a unidade/quantidade e o preço total, sem parcelas.</label>
      {profit !== null ? <p className={`text-lg font-semibold ${profit >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>{confirmed ? 'Simulação com comparação confirmada' : 'Cenário ainda sem confirmação'}: {formatCurrencyBRL(profit)} por pedido • margem {margin?.toFixed(1)}%</p> : <p className="text-sm text-slate-400">Selecione ou informe custo e preço de venda para calcular a margem.</p>}
      <button type="button" disabled={!valid || !confirmed || !(costSource || priceSource)} onClick={() => onPrepareProduct({ name: report.query, supplierCost: parse(cost), suggestedPrice: parse(price), estimatedFreight: parse(freight), sourceUrl: costSource || priceSource, costSourceUrl: costSource || undefined, priceSourceUrl: priceSource || undefined, description: `Pesquisa de ${report.query}. Custo e preço selecionados pelo usuário; dados consultados em ${report.retrievedAt}. Outros custos simulados: ${other}; taxas percentuais: ${fee}.` })} className="bg-emerald-600 rounded-lg px-3 py-2 text-sm disabled:opacity-40">Revisar e cadastrar produto</button>
    </section>
    <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Mostrar também páginas sem dados comerciais ou indícios de vendas</label>
    {groups.map(group => {
      const all = report.sources.filter(s => s.group === group.key);
      const sources = showAll ? all : all.filter(s => group.key === 'suppliers' ? s.commercialEvidence.length > 0 && !s.guide : group.key === 'products' ? s.prices.length > 0 : s.salesEvidence.length > 0);
      return <section key={group.key} className="space-y-3"><h4 className="text-lg font-semibold">{group.title} ({sources.length})</h4><p className="text-xs text-slate-400">{group.subtitle}</p>
        {!sources.length && <p className="text-sm text-amber-200">{group.key === 'demand' ? 'Não foram encontrados indícios explícitos de vendas nas fontes consultadas.' : 'Não foram encontrados dados suficientes neste grupo. Tente informar um modelo ou categoria mais específica.'}</p>}
        <div className="grid lg:grid-cols-2 gap-3">{sources.map(source => <article key={source.url} className="border border-slate-700 rounded-xl p-4 bg-slate-950 space-y-3">
          <div><h5 className="font-medium text-white">{source.title}</h5><p className="text-xs text-slate-400">{source.domain} • {source.extracted ? 'Página lida automaticamente' : 'Somente trecho de busca'}{source.guide ? ' • Guia/lista, não fornecedor identificado' : ''}</p></div>
          {source.prices.length > 0 && <div className="space-y-2"><p className="text-xs font-medium text-emerald-300">Preços mencionados na fonte</p>{source.prices.map((p, i) => <div key={i} className="border border-slate-800 rounded-lg p-2"><p className="font-semibold">{formatCurrencyBRL(p.value)} {p.installment && <span className="text-xs text-amber-300">Parcela/mensalidade detectada</span>}</p><p className="text-xs text-slate-400 mt-1">“{p.context}”</p>{!p.installment && <div className="flex gap-2 mt-2"><button type="button" onClick={() => { setCost(String(p.value)); setCostSource(source.url); setConfirmed(false); }} className="text-xs border border-slate-600 rounded px-2 py-1">Usar como custo</button><button type="button" onClick={() => { setPrice(String(p.value)); setPriceSource(source.url); setConfirmed(false); }} className="text-xs border border-slate-600 rounded px-2 py-1">Usar como preço de venda</button></div>}</div>)}</div>}
          {source.commercialEvidence.length > 0 && <div><p className="text-xs font-medium text-blue-300">Condições mencionadas</p>{source.commercialEvidence.map((text, i) => <p key={i} className="text-xs text-slate-300 mt-1">“{text}”</p>)}</div>}
          {source.salesEvidence.length > 0 && <div><p className="text-xs font-medium text-amber-300">Menções de vendas na fonte</p>{source.salesEvidence.map((text, i) => <p key={i} className="text-xs text-slate-300 mt-1">“{text}”</p>)}</div>}
          <details><summary className="cursor-pointer text-xs text-slate-400">Trecho de busca</summary><p className="text-xs mt-2 text-slate-400">{source.description}</p></details>
          <div className="flex flex-wrap gap-3"><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 underline">Conferir fonte</a>{source.group === 'suppliers' && !source.guide && <button type="button" onClick={() => draftSupplier(source)} className="text-xs text-blue-300 underline">Revisar e cadastrar fornecedor</button>}</div>
        </article>)}</div>
      </section>;
    })}
  </div>;
}
