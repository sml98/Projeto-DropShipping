import type { CalculationInput, CalculationResult } from '@/types';

export function calculateFeasibility(input: CalculationInput): CalculationResult {
  const {
    cost,
    freight,
    sellingPrice,
    cpa,
    isRemessaConforme,
    gatewayFeePercent = 0,
    gatewayFeeFixed = 0,
    taxPercent = 0,
    importTaxAmount = 0,
    otherCosts = 0
  } = input;

  for (const [name, value] of Object.entries(input)) {
    if (typeof value === 'number' && (!Number.isFinite(value) || value < 0)) throw new RangeError(`Valor inválido: ${name}`);
  }
  if (gatewayFeePercent > 100 || taxPercent > 100) throw new RangeError('Taxa deve estar entre 0 e 100%.');

  const validCost = Math.max(0, cost || 0);
  const validFreight = Math.max(0, freight || 0);
  const validSellingPrice = Math.max(0, sellingPrice || 0);
  const validCpa = Math.max(0, cpa || 0);

  // CIF aduaneiro (Custo + Frete)
  const cifValue = validCost + validFreight;

  let remessaConformeImportTax = 0;
  const remessaConformeIcms = 0;

  if (isRemessaConforme) {
    remessaConformeImportTax = Math.max(0, importTaxAmount || 0);
  }

  const remessaConformeTotalTax = remessaConformeImportTax + remessaConformeIcms;
  const totalProductAndFreightCost = cifValue + remessaConformeTotalTax;

  // Taxas informadas pelo usuário
  const gatewayDeduction = validSellingPrice > 0 
    ? (validSellingPrice * (gatewayFeePercent / 100)) + gatewayFeeFixed 
    : 0;

  // Alíquota efetiva informada pelo usuário
  const taxDeduction = validSellingPrice > 0 
    ? validSellingPrice * (taxPercent / 100) 
    : 0;

  // Custo operacional total consolidado
  const totalOperatingCost = 
    totalProductAndFreightCost + 
    gatewayDeduction + 
    taxDeduction + 
    validCpa + Math.max(0, otherCosts || 0);

  // Resultado estimado por pedido
  const netProfit = validSellingPrice - totalOperatingCost;

  // Margem estimada
  const netMargin = validSellingPrice > 0 
    ? (netProfit / validSellingPrice) * 100 
    : 0;

  // ROAS de Equilíbrio (Break-Even ROAS)
  // Gastos sem anúncio por venda
  const costWithoutCpa = totalProductAndFreightCost + gatewayDeduction + taxDeduction + Math.max(0, otherCosts || 0);
  const marginBeforeAds = validSellingPrice - costWithoutCpa;
  const breakEvenRoas = marginBeforeAds > 0 
    ? validSellingPrice / marginBeforeAds 
    : null;

  // Veredito Inteligente
  let verdict: 'excelente' | 'moderado' | 'inviavel' = 'inviavel';
  let verdictTitle = '';
  let verdictDescription = '';

  if (netMargin >= 25 && netProfit >= 35) {
    verdict = 'excelente';
    verdictTitle = 'Margem estimada elevada';
    verdictDescription = 'Margem líquida saudável acima de 25% com margem de segurança para oscilações no leilão do Facebook/TikTok Ads.';
  } else if (netProfit >= 0 && validSellingPrice > 0) {
    verdict = 'moderado';
    verdictTitle = 'Resultado estimado positivo (validar custos)';
    verdictDescription = 'O resultado cobre os custos informados. Confirme custos omitidos e variações no CPA antes de investir.';
  } else {
    verdict = 'inviavel';
    verdictTitle = 'Inviável / Risco de Prejuízo';
    verdictDescription = 'O preço não cobre os custos informados, ou falta informar o preço de venda.';
  }

  return {
    grossRevenue: validSellingPrice,
    remessaConformeImportTax,
    remessaConformeIcms,
    remessaConformeTotalTax,
    totalProductAndFreightCost,
    gatewayDeduction,
    taxDeduction,
    cpaCost: validCpa,
    otherCosts: Math.max(0, otherCosts || 0),
    totalOperatingCost,
    netProfit,
    netMargin,
    breakEvenRoas,
    verdict,
    verdictTitle,
    verdictDescription
  };
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function formatPercentBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 2
  }).format(value || 0) + '%';
}
