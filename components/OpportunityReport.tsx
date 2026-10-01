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
  const [activeGroup, setActiveGroup] = useState('suppliers');
  const [showAll, setShowAll] = useState(false);
  const assumptions = Object.fromEntries(Object.entries(inputs).map(([key, value]) => [key, value.trim() ? Number(value.replace(',', '.')) : NaN])) as unknown as OfferAssumptions;
  const groups = [ { key: 'suppliers', title: 'Fornecedores' }, { key: 'products', title: 'Produtos' }, { key: 'demand', title: 'Vendas' } ];
  function exportReport() {
    const blob = new Blob([JSON.stringify({ ...report, simulationAssumptions: assumptions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'pesquisa-dropshipping.json'; link.click(); URL.revokeObjectURL(url);
  }
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-xl font-semibold">Análise: {report.query}</h3><p className="text-xs text-slate-400">{new Date(report.retrievedAt).toLocaleString('pt-BR')} • {report.sources.filter(s => s.extracted).length} páginas lidas • {report.sources.filter(s => s.prices.length).length} fontes com preços</p></div><button type="button" onClick={exportReport} className="border border-slate-600 rounded-lg px-3 py-2 text-sm">Baixar análise com fontes</button></div>
    {report.warnings.length > 0 && <details className="text-xs rounded-lg border border-amber-900/50 px-3 py-2"><summary className="cursor-pointer text-amber-200">{report.warnings.length} observação(ões) sobre os dados</summary><div className="mt-2 space-y-2">{report.warnings.map((warning, i) => <p key={i} className="text-slate-400">{warning}</p>)}</div></details>}
    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-sm text-slate-300">Meta de margem: <strong className="text-emerald-300">{inputs.targetMarginPercent}%</strong> · Venda e lucro são simulações.</p>
      <p className="text-xs text-slate-500 mt-1">Custos zerados não estão incluídos. Vendas e confiabilidade não são auditadas.</p>
      <details className="mt-3"><summary className="cursor-pointer text-sm text-emerald-300">Ajustar custos e margem</summary><div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{fields.map(field => <label key={field.key} className="text-xs text-slate-300">{field.label}<input type="number" min="0" step="0.01" value={inputs[field.key]} onChange={e => setInputs(prev => ({ ...prev, [field.key]: e.target.value }))} className="block w-full mt-1 p-2 bg-slate-900 border border-slate-700 rounded-lg" /></label>)}</div><p className="text-xs text-slate-400 mt-4 leading-relaxed">Os mesmos parâmetros recalculam todos os cartões. A venda é calculada para atingir a meta; não é preço confirmado de mercado. Informe frete, impostos, taxas e anúncios antes de decidir comprar. Câmbio de referência com data; encargos de câmbio devem incluir seus custos de conversão. Mínimos, parcelas e kits detectados não entram como custo unitário.</p></details>
    </div>
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Resultados da análise">{groups.map(group => <button key={group.key} type="button" role="tab" id={`report-tab-${group.key}`} aria-controls={`report-panel-${group.key}`} aria-selected={activeGroup === group.key} tabIndex={activeGroup === group.key ? 0 : -1} onKeyDown={e => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      const index = groups.findIndex(item => item.key === group.key);
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? groups.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + groups.length) % groups.length;
      setActiveGroup(groups[next].key);
      document.getElementById(`report-tab-${groups[next].key}`)?.focus();
    }} onClick={() => setActiveGroup(group.key)} className={`px-4 py-2 rounded-lg text-sm border ${activeGroup === group.key ? 'border-emerald-700 bg-emerald-950/50 text-emerald-300' : 'border-slate-800 text-slate-400 hover:text-slate-200'}`}>{group.title} <span className="ml-1 text-xs">{report.sources.filter(s => s.group === group.key && (showAll || (group.key === 'suppliers' ? s.commercialEvidence.length > 0 && !s.guide : group.key === 'products' ? s.prices.length > 0 : s.salesEvidence.length > 0))).length}</span></button>)}</div>
    <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />Incluir resultados com dados incompletos</label>
    {groups.map(group => {
      const all = report.sources.filter(s => s.group === group.key);
      const sources = showAll ? all : all.filter(s => group.key === 'suppliers' ? s.commercialEvidence.length > 0 && !s.guide : group.key === 'products' ? s.prices.length > 0 : s.salesEvidence.length > 0);
      return <section key={group.key} id={`report-panel-${group.key}`} role="tabpanel" hidden={group.key !== activeGroup} tabIndex={0} aria-labelledby={`report-tab-${group.key}`} className="space-y-3">
        {!sources.length && <p className="text-sm text-amber-200">Não foram encontrados dados suficientes neste grupo. Tente informar um modelo ou categoria mais específica.</p>}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4 items-start">{sources.map(source => <SourceOfferCard key={source.url} source={source} report={report} assumptions={assumptions} onPrepareProduct={onPrepareProduct} onPrepareSupplier={onPrepareSupplier} />)}</div>
      </section>;
    })}
  </div>;
}
