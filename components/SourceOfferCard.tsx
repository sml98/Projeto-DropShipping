'use client';
import { useState } from 'react';
import type { Product, Supplier } from '@/types';
import type { PriceEvidence, ResearchReport, SourceAnalysis } from '@/lib/research-report';
import type { OfferAssumptions } from '@/lib/offer-calculator';
import { simulateOffer } from '@/lib/offer-calculator';
import { formatCurrencyBRL } from '@/lib/calculator';

function OfferPrice({ price, assumptions, source, query, onPrepareProduct }: { price: PriceEvidence; assumptions: OfferAssumptions; source: SourceAnalysis; query: string; onPrepareProduct: (draft: Partial<Product>) => void }) {
  const [confirmed, setConfirmed] = useState(false);
  const scenario = simulateOffer(price, assumptions);
  const reason = price.currency === 'UNKNOWN' ? 'Moeda ambígua: sem conversão' : price.brlValue == null ? 'Sem cotação disponível' : price.minimum ? 'Valor mínimo/pedido mínimo: não é custo unitário confirmado' : price.installment ? 'Parcela/mensalidade: não é preço total' : price.nonProductCharge ? 'Frete/desconto: não é custo do produto' : price.bulk ? 'Kit/lote: quantidade precisa ser confirmada' : 'Meta e taxas inválidas para calcular';
  return <div className="border border-slate-700 rounded-xl p-3 space-y-2">
    <p className="font-semibold">{price.text} <span className="text-xs text-slate-400">{price.currency === 'UNKNOWN' ? 'moeda não identificada' : price.currency}</span></p>
    {price.brlValue != null && price.currency !== 'BRL' && <p className="text-sm text-emerald-300">≈ {formatCurrencyBRL(price.brlValue)} antes dos encargos de câmbio</p>}
    {price.conversion && <p className="text-xs text-slate-400">1 {price.currency} = R$ {price.conversion.rate.toFixed(4)} • cotação de {price.conversion.date} • <a href={price.conversion.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">Frankfurter</a></p>}
    <p className="text-xs text-slate-400">“{price.context}”</p>
    {scenario ? <>
      <div className="grid grid-cols-2 gap-2 text-sm bg-emerald-950/30 p-3 rounded-lg">
        <div><p className="text-xs text-slate-400">Compra na fonte + encargos de câmbio</p><strong>{formatCurrencyBRL(scenario.cost)}</strong></div>
        <div><p className="text-xs text-slate-400">Venda calculada para meta de {assumptions.targetMarginPercent}%</p><strong>{formatCurrencyBRL(scenario.sellingPrice)}</strong></div>
        <div><p className="text-xs text-slate-400">Lucro simulado por pedido</p><strong>{formatCurrencyBRL(scenario.netProfit)}</strong></div>
        <div><p className="text-xs text-slate-400">Margem simulada</p><strong>{scenario.netMargin.toFixed(1)}%</strong></div>
        <div><p className="text-xs text-slate-400">Custo total por pedido</p><strong>{formatCurrencyBRL(scenario.totalOperatingCost)}</strong></div>
        <div><p className="text-xs text-slate-400">ROAS de equilíbrio</p><strong>{scenario.breakEvenRoas?.toFixed(2) || 'Inviável'}</strong></div>
      </div>
      <p className="text-xs text-amber-200">Cenário automático: a venda é calculada, não observada. O valor da fonte pode ser de varejo, variação ou outro produto. Custos zerados não entram no cálculo.</p>
      <details><summary className="text-xs cursor-pointer text-slate-400">Detalhamento do cálculo</summary><p className="text-xs mt-2">Compra {formatCurrencyBRL(scenario.cost)} + frete {formatCurrencyBRL(assumptions.freight)} + tributos de importação {formatCurrencyBRL(assumptions.importTaxAmount)} + CPA {formatCurrencyBRL(assumptions.cpa)} + outros {formatCurrencyBRL(assumptions.otherCosts)} + gateway {formatCurrencyBRL(scenario.gatewayDeduction)} + tributos sobre venda {formatCurrencyBRL(scenario.taxDeduction)}.</p></details>
      <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />Confirmei produto, unidade, preço total e disponibilidade nesta fonte.</label>
      <button type="button" disabled={!confirmed} onClick={() => onPrepareProduct({ name: query, supplierCost: scenario.cost, suggestedPrice: scenario.sellingPrice, estimatedFreight: assumptions.freight, sourceUrl: source.url, costSourceUrl: source.url, description: `Cenário de compra em ${source.url}. Preço original: ${price.text} (${price.currency}). Venda calculada para meta de margem ${assumptions.targetMarginPercent}%, não preço observado. Custos simulados: ${JSON.stringify(assumptions)}. ${price.conversion ? `Câmbio: ${price.conversion.rate}, data ${price.conversion.date}, fonte ${price.conversion.sourceUrl}.` : ''}` })} className="text-xs border border-emerald-700 text-emerald-300 rounded px-3 py-2 disabled:opacity-40">Revisar e cadastrar este cenário</button>
    </> : <p className="text-xs text-amber-300">Cálculo indisponível: {reason}.</p>}
  </div>;
}
export function SourceOfferCard({ source, report, assumptions, onPrepareProduct, onPrepareSupplier }: { source: SourceAnalysis; report: ResearchReport; assumptions: OfferAssumptions; onPrepareProduct: (draft: Partial<Product>) => void; onPrepareSupplier: (draft: Partial<Supplier>) => void }) {
  const reputation = report.reputationChecks?.find(check => check.domain === source.domain);
  return <article className="border border-slate-700 rounded-xl p-4 bg-slate-950 space-y-4">
    <div><h5 className="font-medium">{source.title}</h5><p className="text-xs text-slate-400">{source.domain} • {source.extracted ? 'Página lida automaticamente' : 'Somente trecho de busca'}{source.guide ? ' • Guia/lista' : ''}</p></div>
    <section className="p-3 border border-slate-800 rounded-lg space-y-2"><h6 className="text-sm font-medium text-blue-300">Compras e confiabilidade</h6>
      <p className="text-xs">Volume de compras da empresa: <strong>não verificado</strong>. Não há acesso ao histórico de pedidos desta fonte.</p>
      {source.salesEvidence.length > 0 ? <div><p className="text-xs text-amber-300">Menções publicadas na página — podem ser do produto ou de uma lista:</p>{source.salesEvidence.map((text, i) => <p key={i} className="text-xs mt-1">“{text}”</p>)}</div> : <p className="text-xs text-slate-400">Sem número de vendas ou menção explícita de mais vendidos na página consultada.</p>}
      <p className="text-xs">Confiabilidade: <strong>não auditada</strong>. Site com preço, HTTPS ou muitas avaliações não é garantia de entrega.</p>
      {reputation?.error && <p className="text-xs text-amber-300">{reputation.error}</p>}
      {reputation && !reputation.error && !reputation.results.length && <p className="text-xs text-slate-400">Pesquisa externa realizada, sem relatos encontrados. Isso não comprova boa reputação.</p>}
      {!reputation && <p className="text-xs text-slate-400">Reputação externa não consultada para este domínio nesta análise.</p>}
      {(reputation?.results.length || 0) > 0 && <div className="space-y-2"><p className="text-xs text-amber-200">Páginas externas encontradas para o domínio. A identidade da empresa e o período ainda precisam ser confirmados.</p>{reputation?.results.slice(0, 3).map(result => <div key={result.url} className="text-xs border-l-2 border-blue-800 pl-2"><a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-300 underline">{result.title}</a><p className="mt-1 text-slate-400">{result.description}</p></div>)}</div>}
    </section>
    {source.prices.map((price, i) => <OfferPrice key={i} price={price} assumptions={assumptions} source={source} query={report.query} onPrepareProduct={onPrepareProduct} />)}
    {!source.prices.length && <p className="text-xs text-slate-400">Preço não identificado; não há base para simular a margem desta fonte.</p>}
    {source.commercialEvidence.length > 0 && <details><summary className="cursor-pointer text-xs text-blue-300">Condições comerciais encontradas</summary>{source.commercialEvidence.map((text, i) => <p key={i} className="text-xs mt-2">“{text}”</p>)}</details>}
    <details><summary className="cursor-pointer text-xs text-slate-400">Trecho de busca original</summary><p className="text-xs mt-2">{source.description}</p></details>
    <div className="flex gap-3 flex-wrap"><a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-300 underline">Conferir fonte</a>{source.group === 'suppliers' && !source.guide && <button type="button" onClick={() => onPrepareSupplier({ name: source.title, catalogUrl: source.url, sourceUrl: source.url, description: source.commercialEvidence.join('\n') || source.description, category: report.query })} className="text-xs text-blue-300 underline">Revisar e cadastrar fornecedor</button>}</div>
  </article>;
}
