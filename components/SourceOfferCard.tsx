'use client';
import { useState } from 'react';
import { ChevronDown, ExternalLink } from 'lucide-react';
import type { Product, Supplier } from '@/types';
import type { ResearchReport, SourceAnalysis } from '@/lib/research-report';
import type { OfferAssumptions } from '@/lib/offer-calculator';
import { simulateOffer } from '@/lib/offer-calculator';
import { formatCurrencyBRL } from '@/lib/calculator';

export function SourceOfferCard({ source, report, assumptions, onPrepareProduct, onPrepareSupplier }: { source: SourceAnalysis; report: ResearchReport; assumptions: OfferAssumptions; onPrepareProduct: (draft: Partial<Product>) => void; onPrepareSupplier: (draft: Partial<Supplier>) => void }) {
  const firstEligible = source.prices.findIndex(price => simulateOffer(price, assumptions));
  const [selected, setSelected] = useState(firstEligible >= 0 ? firstEligible : 0);
  const [confirmed, setConfirmed] = useState(false);
  const price = source.prices[selected];
  const scenario = price ? simulateOffer(price, assumptions) : null;
  const reputation = report.reputationChecks?.find(check => check.domain === source.domain);
  const reason = !price ? 'Preço não encontrado' : price.currency === 'UNKNOWN' ? 'Moeda não identificada' : price.brlValue == null ? 'Conversão indisponível' : price.minimum ? 'Pedido mínimo / valor mínimo' : price.installment ? 'Parcela, não preço total' : price.nonProductCharge ? 'Frete ou desconto' : price.bulk ? 'Kit ou lote: confirmar unidade' : 'Revise os parâmetros da simulação';
  const reputationLabel = reputation?.error ? 'Consulta indisponível' : reputation?.results.length ? `${reputation.results.length} relatos encontrados` : reputation ? 'Sem relatos encontrados' : 'Não consultada';
  function prepareProduct() {
    if (!scenario || !price || !confirmed) return;
    onPrepareProduct({ name: report.query, supplierCost: scenario.cost, suggestedPrice: scenario.sellingPrice, estimatedFreight: assumptions.freight, sourceUrl: source.url, costSourceUrl: source.url, description: `Cenário de compra em ${source.url}. Preço original: ${price.text} (${price.currency}). Venda calculada para meta de margem ${assumptions.targetMarginPercent}%, não preço observado. Custos simulados: ${JSON.stringify(assumptions)}. ${price.conversion ? `Câmbio: ${price.conversion.rate}, data ${price.conversion.date}, fonte ${price.conversion.sourceUrl}.` : ''}` });
  }
  return <article className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden">
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h5 className="font-semibold text-slate-100 leading-snug line-clamp-2" title={source.title}>{source.title}</h5><p className="text-xs text-slate-500 mt-1 truncate">{source.domain}</p></div><a href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir fonte: ${source.title}`} className="shrink-0 p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-emerald-300"><ExternalLink className="w-4 h-4" /></a></div>
      {source.prices.length > 1 ? <label className="block text-xs text-slate-400">Preço na fonte · {source.prices.length} valores encontrados<select aria-label={`Preço na fonte ${source.domain}`} value={selected} onChange={e => { setSelected(Number(e.target.value)); setConfirmed(false); }} className="block mt-1.5 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100">{source.prices.map((item, i) => <option key={i} value={i}>{item.text} · {item.currency === 'UNKNOWN' ? 'moeda incerta' : item.currency}{item.minimum ? ' · mínimo' : item.installment ? ' · parcela' : item.bulk ? ' · kit/lote' : item.nonProductCharge ? ' · encargo/desconto' : ''}</option>)}</select></label> : <p className="text-sm text-slate-300">{price ? `Preço na fonte: ${price.text}` : 'Preço não publicado nos dados encontrados'}</p>}
      {scenario ? <div className="grid grid-cols-3 gap-2 border-y border-slate-800 py-4">
        <div><p className="text-xs text-slate-400 mb-1">Compra</p><p className="font-semibold text-sm sm:text-base">{formatCurrencyBRL(scenario.cost)}</p></div>
        <div><p className="text-xs text-slate-400 mb-1">Venda simulada</p><p className="font-semibold text-sm sm:text-base">{formatCurrencyBRL(scenario.sellingPrice)}</p></div>
        <div><p className="text-xs text-slate-400 mb-1">Lucro simulado</p><p className="font-semibold text-sm sm:text-base text-emerald-300">{formatCurrencyBRL(scenario.netProfit)}</p></div>
      </div> : <div className="border-y border-slate-800 py-4"><p className="text-sm text-slate-400">Sem simulação</p><p className="text-xs text-slate-500 mt-1">{reason}</p></div>}
      <div className="grid grid-cols-2 gap-3 text-xs"><div><p className="text-slate-500 mb-1">Vendas</p><p className="text-slate-300">{source.salesEvidence.length ? 'Menção na fonte' : 'Sem dados'}</p></div><div><p className="text-slate-500 mb-1">Reputação</p><p className="text-slate-300">{reputationLabel}</p></div></div>
    </div>
    <details className="group border-t border-slate-800">
      <summary className="list-none cursor-pointer px-5 py-3 flex justify-between items-center text-sm text-emerald-300 hover:bg-slate-900">Ver detalhes<ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" /></summary>
      <div className="px-5 pb-5 space-y-5 text-sm">
        {price && <section><h6 className="font-medium text-slate-200 mb-2">Origem do preço</h6><p className="text-xs text-slate-400 leading-relaxed">“{price.context}”</p>{price.conversion && <p className="text-xs text-slate-400 mt-2">{price.text} ≈ {formatCurrencyBRL(price.brlValue || 0)} · 1 {price.currency} = R$ {price.conversion.rate.toFixed(4)} em {price.conversion.date}. <a href={price.conversion.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline">Fonte do câmbio</a></p>}<p className="text-xs text-slate-500 mt-2">{source.extracted ? 'Página lida automaticamente.' : 'Dados obtidos apenas do trecho de busca.'} {source.guide && 'Esta página é um guia/lista.'}</p></section>}
        {scenario && <section><h6 className="font-medium text-slate-200 mb-2">Cálculo por pedido</h6><dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-400">{[
          ['Margem simulada', `${scenario.netMargin.toFixed(1)}%`], ['ROAS de equilíbrio', scenario.breakEvenRoas?.toFixed(2) || 'Inviável'], ['Custo total', formatCurrencyBRL(scenario.totalOperatingCost)], ['Frete', formatCurrencyBRL(assumptions.freight)], ['CPA', formatCurrencyBRL(assumptions.cpa)], ['Importação', formatCurrencyBRL(assumptions.importTaxAmount)], ['Gateway / marketplace', formatCurrencyBRL(scenario.gatewayDeduction)], ['Tributos sobre venda', formatCurrencyBRL(scenario.taxDeduction)], ['Outros custos', formatCurrencyBRL(assumptions.otherCosts)],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd className="text-slate-200 mt-0.5">{value}</dd></div>)}</dl></section>}
        <section><h6 className="font-medium text-slate-200 mb-2">Vendas e reputação</h6><p className="text-xs text-slate-400 mb-3">Compras da empresa não verificadas. Confiabilidade não auditada. Relatos encontrados podem se referir a outra empresa ou período.</p>{source.salesEvidence.map((text, i) => <p key={i} className="text-xs text-slate-400 mb-2 leading-relaxed">“{text}”</p>)}{reputation?.error && <p className="text-xs text-amber-200">{reputation.error}</p>}{reputation?.results.slice(0, 3).map(result => <div key={result.url} className="mt-3"><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-300 underline">{result.title}</a><p className="text-xs text-slate-400 mt-1 leading-relaxed">{result.description}</p></div>)}{reputation && !reputation.error && !reputation.results.length && <p className="text-xs text-slate-400">A pesquisa externa não encontrou relatos. Isso não comprova boa reputação.</p>}</section>
        {source.commercialEvidence.length > 0 && <section><h6 className="font-medium text-slate-200 mb-2">Condições publicadas</h6>{source.commercialEvidence.map((text, i) => <p key={i} className="text-xs text-slate-400 leading-relaxed mt-2">“{text}”</p>)}</section>}
        <details><summary className="cursor-pointer text-xs text-slate-500">Trecho original da pesquisa</summary><p className="text-xs text-slate-400 leading-relaxed mt-2">{source.description}</p></details>
        {scenario && <div className="space-y-3 border-t border-slate-800 pt-4"><label className="flex items-start gap-2 text-xs text-slate-300"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confirmei produto, unidade, preço total e disponibilidade.</label><button type="button" disabled={!confirmed} onClick={prepareProduct} className="text-sm bg-emerald-600 text-white rounded-lg px-3 py-2 disabled:opacity-40">Cadastrar produto</button></div>}
        {source.group === 'suppliers' && !source.guide && <button type="button" onClick={() => onPrepareSupplier({ name: source.title, catalogUrl: source.url, sourceUrl: source.url, description: source.commercialEvidence.join('\n') || source.description, category: report.query })} className="text-sm border border-slate-700 rounded-lg px-3 py-2 text-blue-300">Cadastrar fornecedor</button>}
      </div>
    </details>
  </article>;
}
