import type { Currency, ExchangeRate } from './exchange-rates.ts';
import type { ResearchResult } from './research.ts';

export type ResearchGroup = 'suppliers' | 'products' | 'demand';
export interface PriceEvidence {
  value: number; text: string; context: string; installment: boolean;
  currency: Currency | 'UNKNOWN'; brlValue: number | null; conversion?: ExchangeRate;
  nonProductCharge: boolean; bulk: boolean; minimum: boolean;
}
export interface SourceAnalysis extends ResearchResult {
  group: ResearchGroup; domain: string; extracted: boolean;
  prices: PriceEvidence[]; commercialEvidence: string[]; salesEvidence: string[];
  guide: boolean;
}
export interface ResearchReport {
  query: string; sources: SourceAnalysis[]; warnings: string[]; retrievedAt: string;
  searchCalls: number; extractionAttempted: boolean;
  reputationChecks?: { domain: string; results: ResearchResult[]; error?: string }[];
}
const clean = (text: string) => text.replace(/<[^>]*>/g, '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
export function analyzeSource(source: ResearchResult, group: ResearchGroup, raw?: string): SourceAnalysis {
  const content = clean(typeof raw === 'string' && raw.trim() ? raw.slice(0, 18000) : source.description);
  const prices: PriceEvidence[] = [];
  for (const match of content.matchAll(/(R\$|BRL|US\$|USD|EUR|€|GBP|£|CNY|RMB|CN¥|\$|¥)\s*(\d[\d.,]*)/g)) {
    const text = match[0]; const numeric = match[2].replace(/[.,]+$/, '');
    const symbol = match[1];
    const currencies: Record<string, Currency> = { 'R$': 'BRL', BRL: 'BRL', 'US$': 'USD', USD: 'USD', EUR: 'EUR', '€': 'EUR', GBP: 'GBP', '£': 'GBP', CNY: 'CNY', RMB: 'CNY', 'CN¥': 'CNY' };
    const currency = currencies[symbol] || 'UNKNOWN';
    let value: number;
    if (/^\d+$/.test(numeric)) value = Number(numeric);
    else if (/^\d+[.,]\d{2}$/.test(numeric)) value = Number(numeric.replace(',', '.'));
    else if (/^\d{1,3}(?:\.\d{3})+,\d{2}$/.test(numeric)) value = Number(numeric.replace(/\./g, '').replace(',', '.'));
    else if (/^\d{1,3}(?:,\d{3})+\.\d{2}$/.test(numeric)) value = Number(numeric.replace(/,/g, ''));
    else if (currency === 'BRL' && /^\d{1,3}(?:\.\d{3})+$/.test(numeric)) value = Number(numeric.replace(/\./g, ''));
    else continue;
    const start = match.index || 0;
    const before = content.slice(Math.max(0, start - 35), start);
    const after = content.slice(start + text.length, start + text.length + 35);
    const installment = /\d+\s*x\s*(?:de|por)?\s*$/i.test(before) || /(?:parcela|mensalidade)/i.test(before + after);
    const context = content.slice(Math.max(0, start - 90), start + text.length + 90);
    const nonProductCharge = /(?:frete|envio|desconto|cupom|economize)\s*(?:de|por|:)?\s*$/i.test(before);
    const minimum = /(?:pedido|compra|valor)\s+m[ií]nim[oa]|(?:m[ií]n\.|min\.|minimum order|moq)\s*(?:de|:)?\s*$/i.test(before);
    const bulk = /(?:kit|lote|pacote)\s*(?:com|de)?\s*\d+|\d+\s*(?:peças|unidades)\s*(?:por|:)?/i.test(before + after);
    if (value > 0 && Number.isFinite(value) && !prices.some(p => p.value === value && p.currency === currency && p.installment === installment)) prices.push({ value, text, context, installment, currency, brlValue: currency === 'BRL' ? value : null, nonProductCharge, bulk, minimum });
    if (prices.length >= 8) break;
  }
  const lines = (typeof raw === 'string' ? raw : source.description).split(/\n+|(?<=[.!?;])\s+/).map(clean).filter(Boolean);
  const commercialEvidence = lines.filter(line => /dropshipping|drop shipping|envio direto|despacho|pedido m[ií]nimo|atacado|frete|prazo|estoque/i.test(line)).slice(0, 5).map(line => line.slice(0, 450));
  const salesEvidence = lines.filter(line => /mais vendidos|best.?sellers|\d[\d.,\s]*\+?\s*(?:unidades?\s+)?vendid[oa]s|\d[\d.,\s]*\s+vendas/i.test(line)).slice(0, 4).map(line => line.slice(0, 450));
  return { ...source, group, domain: new URL(source.url).hostname.replace(/^www\./, ''), extracted: Boolean(raw?.trim()), prices, commercialEvidence, salesEvidence, guide: /melhores fornecedores|lista de fornecedores|como (?:vender|encontrar)|guia|top \d+/i.test(source.title) };
}
