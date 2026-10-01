'use client';
import { useState } from 'react';
import type { Product, Supplier } from '@/types';
import type { ResearchReport } from '@/lib/research-report';
import { DEFAULT_OFFER_ASSUMPTIONS, type OfferAssumptions } from '@/lib/offer-calculator';
import { SourceOfferCard } from './SourceOfferCard';
interface Props { report: ResearchReport; onPrepareProduct: (draft: Partial<Product>) => void; onPrepareSupplier: (draft: Partial<Supplier>) => void }
const fields: { key: keyof OfferAssumptions; label: string }[] = [
  { key: 'freight', label: 'Frete por pedido (R$)' }, { key: 'cpa', label: 'Anúncios / CPA (R$)' },
  { key: 'otherCosts', label: 'Outros custos por pedido (R$)' }, { key: 'gatewayFeePercent', label: 'Gateway / marketplace (%)' },
  { key: 'gatewayFeeFixed', label: 'Taxa fixa por pedido (R$)' }, { key: 'taxPercent', label: 'Tributos sobre venda (%)' },
  { key: 'importTaxAmount', label: 'Tributos de importação por pedido (R$)' }, { key: 'exchangeSpreadPercent', label: 'Encargos de câmbio (%)' },
  { key: 'targetMarginPercent', label: 'Meta de margem líquida (%)' },
];
export function OpportunityReport({ report, onPrepareProduct, onPrepareSupplier }: Props) {
  const [inputs, setInputs] = useState(Object.fromEntries(Object.entries(DEFAULT_OFFER_ASSUMPTIONS).map(([key, value]) => [key, String(value)])));
  const [showAll, setShowAll] = useState(false);
  const assumptions = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() ? Number(value.replace(',', '.')) : NaN])) as unknown as OfferAssumptions;
  const groups = [ { key: 'suppliers', title: 'Candidatos a fornecedor' }, { key: 'products', title: 'Produtos e preços de mercado' }, { key: 'demand', title: 'Indícios de vendas' } ];
  function exportReport() {
    const blob = new Blob([JSON.stringify({ ...report, simulationAssumptions: assumptions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pesquisa-dropshipping.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-semibold">Análise: {report.query}</h3><p className="text-xs text-slate-400">{new Date(report.retrievedAt).toLocaleString('pt-BR')} • {report.sources.filter(s => s.extracted).length} páginas lidas • {report.sources.filter(s => s.prices.length).length} fontes com preços</p></div><button type="button" onClick={exportReport} className="border border-slate-600 rounded-lg px-3 py-2 text-sm">Baixar análise com fontes</button></div>
    {report.warnings.map((warning, i) => <p key={i} role="status" className="text-sm text-amber-300">{warning}</p>)}
    <section className="rounded-xl bg-emerald-950/30 border border-emerald-800 p-4 space-y-3">
      <h4 className="font-semibold">Cálculo automático em cada oferta</h4>
      <p className="text-sm text-slate-300">Cada preço elegível abaixo já tem uma simulação de compra e revenda com meta de margem de {inputs.targetMarginPercent}%. Ajuste os custos uma vez para recalcular todas as ofertas.</p>
      <p className="text-xs text-amber-200">A meta inicial de 30% é uma hipótese ajustável. Custos iniciais zerados não significam frete grátis ou isenção. Não temos sua cotação de frete, carga tributária ou CPA; informe-os antes de decidir comprar. O preço de venda calculado não garante aceitação pelo mercado.</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{fields.map(field => <label key={field.key} className="text-xs text-slate-300">{field.label}<input type="number" min="0" step="0.01" value={inputs[field.key]} onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))} className="block w-full mt-1 p-2 bg-slate-950 border border-slate-700 rounded-lg" /></label>)}</div>
      <p className="text-xs text-slate-400">Câmbio: conversão de referência com taxa e data, quando a moeda está explícita. Encargos de câmbio podem incluir spread/IOF informado por você. Não identificamos moeda apenas pelo país do site. Parcelas, frete, descontos e kits detectados ficam fora do cálculo automático.</p>
    </section>
    <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Mostrar também páginas sem dados comerciais ou indícios de vendas</label>
    {groups.map(group => {
      const all = report.sources.filter(s => s.group === group.key);
      const sources = showAll ? all : all.filter(s => group.key === 'suppliers' ? s.commercialEvidence.length > 0 && !s.guide : group.key === 'products' ? s.prices.length > 0 : s.salesEvidence.length > 0);
      return <section key={group.key} className="space-y-3"><h4 className="text-lg font-semibold">{group.title} ({sources.length})</h4>
        {!sources.length && <p className="text-sm text-amber-200">Não foram encontrados dados suficientes neste grupo. Tente informar um modelo ou categoria mais específica.</p>}
        <div className="grid lg:grid-cols-2 gap-3">{sources.map(source => <SourceOfferCard key={source.url} source={source} report={report} assumptions={assumptions} onPrepareProduct={onPrepareProduct} onPrepareSupplier={onPrepareSupplier} />)}</div>
      </section>;
    })}
  </div>;
}
