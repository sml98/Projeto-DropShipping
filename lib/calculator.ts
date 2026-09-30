import { CalculationInput, CalculationResult } from '@/types';

export function calculateFeasibility(input: CalculationInput): CalculationResult {
  const {
    cost,
    freight,
    sellingPrice,
    cpa,
    isRemessaConforme,
    gatewayFeePercent = 4.99,
    gatewayFeeFixed = 0.40,
    taxPercent = 4.0
  } = input;

  const validCost = Math.max(0, cost || 0);
  const validFreight = Math.max(0, freight || 0);
  const validSellingPrice = Math.max(0, sellingPrice || 0);
  const validCpa = Math.max(0, cpa || 0);

  // CIF aduaneiro (Custo + Frete)
  const cifValue = validCost + validFreight;

  let remessaConformeImportTax = 0;
  let remessaConformeIcms = 0;

  if (isRemessaConforme && cifValue > 0) {
    // 20% Imposto de Importação Federal sobre CIF
    remessaConformeImportTax = cifValue * 0.20;

    // 17% ICMS Estadual sobre base aduaneira (cálculo oficial por dentro da Receita Federal/Confaz)
    // Base ICMS = (CIF + II) / (1 - 0.17)
    // Valor ICMS = Base ICMS * 0.17
    const baseIcms = (cifValue + remessaConformeImportTax) / (1 - 0.17);
    remessaConformeIcms = baseIcms * 0.17;
  }

  const remessaConformeTotalTax = remessaConformeImportTax + remessaConformeIcms;
  const totalProductAndFreightCost = cifValue + remessaConformeTotalTax;

  // Deduções do Gateway (padrão 4.99% + R$ 0,40)
  const gatewayDeduction = validSellingPrice > 0 
    ? (validSellingPrice * (gatewayFeePercent / 100)) + gatewayFeeFixed 
    : 0;

  // Imposto de Faturamento (Simples Nacional / MEI padrão 4.0%)
  const taxDeduction = validSellingPrice > 0 
    ? validSellingPrice * (taxPercent / 100) 
    : 0;

  // Custo operacional total consolidado
  const totalOperatingCost = 
    totalProductAndFreightCost + 
    gatewayDeduction + 
    taxDeduction + 
    validCpa;

  // Lucro Líquido Real
  const netProfit = validSellingPrice - totalOperatingCost;

  // Margem Líquida Real
  const netMargin = validSellingPrice > 0 
    ? (netProfit / validSellingPrice) * 100 
    : 0;

  // ROAS de Equilíbrio (Break-Even ROAS)
  // Gastos sem anúncio por venda
  const costWithoutCpa = totalProductAndFreightCost + gatewayDeduction + taxDeduction;
  const marginBeforeAds = validSellingPrice - costWithoutCpa;
  const breakEvenRoas = marginBeforeAds > 0 
    ? validSellingPrice / marginBeforeAds 
    : 0;

  // Veredito Inteligente
  let verdict: 'excelente' | 'moderado' | 'inviavel' = 'inviavel';
  let verdictTitle = '';
  let verdictDescription = '';

  if (netMargin >= 25 && netProfit >= 35) {
    verdict = 'excelente';
    verdictTitle = 'Altamente Lucrativo (Pronto para Escala)';
    verdictDescription = 'Margem líquida saudável acima de 25% com margem de segurança para oscilações no leilão do Facebook/TikTok Ads.';
  } else if (netMargin >= 15) {
    verdict = 'moderado';
    verdictTitle = 'Margem Moderada (Monitore o Custo de Anúncios)';
    verdictDescription = 'Operação viável, porém o CPA precisa ser controlado rigidamente para não corroer o lucro líquido.';
  } else {
    verdict = 'inviavel';
    verdictTitle = 'Inviável / Risco de Prejuízo';
    verdictDescription = 'Margem inferior a 15%. Qualquer leve aumento no CPA causará prejuízo na operação. Negocie o fornecedor ou aumente o preço.';
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
