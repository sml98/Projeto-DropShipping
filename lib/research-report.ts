import type { ResearchResult } from './research.ts';

export type ResearchGroup = 'suppliers' | 'products' | 'demand';
export interface PriceEvidence { value: number; text: string; context: string; installment: boolean }
export interface SourceAnalysis extends ResearchResult {
  group: ResearchGroup; domain: string; extracted: boolean;
  prices: PriceEvidence[]; commercialEvidence: string[]; salesEvidence: string[];
  guide: boolean;
}
export interface ResearchReport {
  query: string; sources: SourceAnalysis[]; warnings: string[]; retrievedAt: string;
  searchCalls: number; extractionAttempted: boolean;
}
const clean = (text: string) => text.replace(/<[^>]*>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
export function analyzeSource(source: ResearchResult, group: ResearchGroup, raw?: string): SourceAnalysis {
  const content = clean(typeof raw === 'string' && raw.trim() ? raw.slice(0, 18000) : source.description);
  const prices: PriceEvidence[] = [];
  for (const match of content.matchAll(/R\$\s*(\d[\d.,]*)/g)) {
    const text = match[0]; const numeric = match[1].replace(/[.,]+$/, '');
    if (!/^(?:\d+|\d+,\d{2}|\d{1,3}(?:\.\d{3})+(?:,\d{2})?|\d+\.\d{2})$/.test(numeric)) continue;
    const value = Number(numeric.includes(',') ? numeric.replace(/\./g, '').replace(',', '.') : /^\d{1,3}(?:\.\d{3})+$/.test(numeric) ? numeric.replace(/\./g, '') : numeric);
    const start = match.index || 0;
    const before = content.slice(Math.max(0, start - 35), start);
    const after = content.slice(start + text.length, start + text.length + 35);
    const installment = /\d+\s*x\s*(?:de|por)?\s*$/i.test(before) || /(?:parcela|mensalidade)/i.test(before + after);
    const context = content.slice(Math.max(0, start - 90), start + text.length + 90);
    if (value > 0 && Number.isFinite(value) && !prices.some(p => p.value === value && p.installment === installment)) prices.push({ value, text, context, installment });
    if (prices.length >= 8) break;
  }
  const lines = (typeof raw === 'string' ? raw : source.description).split(/\n+|(?<=[.!?;])\s+/).map(clean).filter(Boolean);
  const commercialEvidence = lines.filter(line => /dropshipping|drop shipping|envio direto|despacho|pedido m[ií]nimo|atacado|frete|prazo|estoque/i.test(line)).slice(0, 5).map(line => line.slice(0, 450));
  const salesEvidence = lines.filter(line => /mais vendidos|best.?sellers|\d[\d.,\s]*\+?\s*(?:unidades?\s+)?vendid[oa]s|\d[\d.,\s]*\s+vendas/i.test(line)).slice(0, 4).map(line => line.slice(0, 450));
  return { ...source, group, domain: new URL(source.url).hostname.replace(/^www\./, ''), extracted: Boolean(raw?.trim()), prices, commercialEvidence, salesEvidence, guide: /melhores fornecedores|lista de fornecedores|como (?:vender|encontrar)|guia|top \d+/i.test(source.title) };
}
