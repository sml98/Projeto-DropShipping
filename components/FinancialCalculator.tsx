'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { CalculationInput, Product } from '@/types';
import { calculateFeasibility, formatCurrencyBRL, formatPercentBR } from '@/lib/calculator';
import { 
  Calculator, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Percent, 
  DollarSign, 
  Truck, 
  ShoppingBag,
  Info,
  RefreshCcw,
  Sliders
} from 'lucide-react';

interface FinancialCalculatorProps {
  initialProduct?: Product | null;
  onNavigateToAi?: (productName: string) => void;
}

export function FinancialCalculator({ initialProduct, onNavigateToAi }: FinancialCalculatorProps) {
  // Inputs initialized with initialProduct if provided
  const [cost, setCost] = useState<string>(
    initialProduct ? initialProduct.supplierCost.toString() : '38.50'
  );
  const [freight, setFreight] = useState<string>(
    initialProduct ? initialProduct.estimatedFreight.toString() : '18.00'
  );
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialProduct ? initialProduct.suggestedPrice.toString() : '129.90'
  );
  const [cpa, setCpa] = useState<string>(
    initialProduct ? (initialProduct.suggestedPrice * 0.22).toFixed(2) : '28.00'
  );
  const [isRemessaConforme, setIsRemessaConforme] = useState<boolean>(
    initialProduct ? initialProduct.origin === 'internacional' : false
  );

  // Advanced toggles/settings
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [gatewayFeePercent, setGatewayFeePercent] = useState<string>('4.99');
  const [gatewayFeeFixed, setGatewayFeeFixed] = useState<string>('0.40');
  const [taxPercent, setTaxPercent] = useState<string>('4.00');

  // Active product name tracking
  const [activeProductName, setActiveProductName] = useState<string>(
    initialProduct ? initialProduct.name : 'Liquidificador Portátil Turbo Fresh'
  );

  // Perform calculation
  const result = useMemo(() => {
    const costNum = parseFloat(cost.replace(',', '.')) || 0;
    const freightNum = parseFloat(freight.replace(',', '.')) || 0;
    const priceNum = parseFloat(sellingPrice.replace(',', '.')) || 0;
    const cpaNum = parseFloat(cpa.replace(',', '.')) || 0;
    const gatewayPct = parseFloat(gatewayFeePercent.replace(',', '.')) || 4.99;
    const gatewayFix = parseFloat(gatewayFeeFixed.replace(',', '.')) || 0.40;
    const taxPct = parseFloat(taxPercent.replace(',', '.')) || 4.0;

    const input: CalculationInput = {
      cost: costNum,
      freight: freightNum,
      sellingPrice: priceNum,
      cpa: cpaNum,
      isRemessaConforme,
      gatewayFeePercent: gatewayPct,
      gatewayFeeFixed: gatewayFix,
      taxPercent: taxPct
    };

    return calculateFeasibility(input);
  }, [cost, freight, sellingPrice, cpa, isRemessaConforme, gatewayFeePercent, gatewayFeeFixed, taxPercent]);

  const handleReset = () => {
    setCost('38.50');
    setFreight('18.00');
    setSellingPrice('129.90');
    setCpa('28.00');
    setIsRemessaConforme(false);
    setActiveProductName('Simulação Padrão Nacional');
  };

  const getVerdictTheme = () => {
    switch (result.verdict) {
      case 'excelente':
        return {
          border: 'border-emerald-500/50',
          bg: 'bg-emerald-950/30',
          badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          icon: ShieldCheck,
          iconColor: 'text-emerald-400',
          barColor: 'bg-emerald-500',
        };
      case 'moderado':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-amber-950/30',
          badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          barColor: 'bg-amber-500',
        };
      case 'inviavel':
      default:
        return {
          border: 'border-rose-500/50',
          bg: 'bg-rose-950/30',
          badgeBg: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
          icon: ShieldAlert,
          iconColor: 'text-rose-400',
          barColor: 'bg-rose-500',
        };
    }
  };

  const theme = getVerdictTheme();
  const VerdictIcon = theme.icon;

  // Calculo de porcentagens de custo para a barra visual
  const safeRevenue = result.grossRevenue > 0 ? result.grossRevenue : 1;
  const costPct = Math.min(100, (result.totalProductAndFreightCost / safeRevenue) * 100);
  const adsPct = Math.min(100, (result.cpaCost / safeRevenue) * 100);
  const taxesPct = Math.min(100, ((result.gatewayDeduction + result.taxDeduction) / safeRevenue) * 100);
  const netProfitPct = Math.max(0, result.netMargin);

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              Filtro de Lucro Real & Viabilidade
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Calculadora Financeira para Dropshipping Híbrido
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Simule a margem líquida real descontando taxas de gateway (4.99% + R$ 0,40), Simples Nacional (4.0%), CPA de tráfego pago e o impacto fiscal da <strong className="text-emerald-400">Remessa Conforme</strong> (20% II + 17% ICMS).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Restaurar Padrão
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Inputs vs Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form Inputs (5 cols on lg) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                Parâmetros da Operação
              </h3>
              <p className="text-xs text-slate-400 truncate max-w-[260px]">
                {activeProductName}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <span>{showAdvanced ? 'Ocultar Taxas' : 'Ajustar Taxas'}</span>
            </button>
          </div>

          {/* TOGGLE REMESSA CONFORME (CRITICAL REQUIREMENT #1) */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isRemessaConforme
              ? 'bg-blue-950/40 border-blue-500/50 shadow-lg shadow-blue-500/5'
              : 'bg-slate-950/60 border-slate-800'
          }`}>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isRemessaConforme}
                onChange={(e) => setIsRemessaConforme(e.target.checked)}
                className="mt-1 w-5 h-5 rounded-md text-blue-500 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-950 cursor-pointer accent-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">
                    Produto Internacional (Remessa Conforme)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    20% II + 17% ICMS
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Aplica automaticamente o Imposto de Importação federal (20%) e o ICMS estadual (17%) sobre o valor aduaneiro (produto + frete).
                </p>
              </div>
            </label>
          </div>

          {/* Primary Inputs */}
          <div className="space-y-4">
            
            {/* Custo no Fornecedor */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                  Custo do Produto no Fornecedor
                </label>
                <span className="text-[11px] text-slate-400">Em Reais (R$)</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Frete */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-slate-400" />
                  Frete por Envio Unitário
                </label>
                <span className="text-[11px] text-slate-400">Correios / Jadlog</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={freight}
                  onChange={(e) => setFreight(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            {/* Preço de Venda Pretendido */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-emerald-300 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Preço de Venda Pretendido na Loja
                </label>
                <span className="text-[11px] text-emerald-400 font-medium">Ticket de Venda</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-base focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* CPA de Anúncios */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  Custo Estimado por Venda em Anúncios (CPA)
                </label>
                <span className="text-[11px] text-slate-400">Meta / TikTok Ads</span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={cpa}
                  onChange={(e) => setCpa(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-semibold text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
              <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                <span>Sugestão: 20% a 25% do valor de venda</span>
                <span>Break-even max: <strong>{formatCurrencyBRL(Math.max(0, result.grossRevenue - (result.totalProductAndFreightCost + result.gatewayDeduction + result.taxDeduction)))}</strong></span>
              </div>
            </div>

          </div>

          {/* Advanced / Custom Fees */}
          {showAdvanced && (
            <div className="pt-4 border-t border-slate-800 space-y-3 bg-slate-950/40 p-4 rounded-2xl animate-in fade-in">
              <div className="text-xs font-semibold text-slate-300 mb-2">Encargos Operacionais Padrão Brasil</div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Gateway (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gatewayFeePercent}
                    onChange={(e) => setGatewayFeePercent(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Taxa Fixa Gateway (R$):</label>
                  <input
                    type="number"
                    step="0.01"
                    value={gatewayFeeFixed}
                    onChange={(e) => setGatewayFeeFixed(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Imposto MEI / Simples Nacional (%):</label>
                <input
                  type="number"
                  step="0.1"
                  value={taxPercent}
                  onChange={(e) => setTaxPercent(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Real-Time Results & Smart Verdict (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Smart Verdict Card */}
          <div className={`p-6 rounded-3xl border transition-all duration-300 ${theme.bg} ${theme.border} shadow-2xl relative overflow-hidden`}>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border ${theme.badgeBg}`}>
                  <VerdictIcon className="w-4 h-4" />
                  Veredito do Filtro
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {result.verdictTitle}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl leading-relaxed">
                  {result.verdictDescription}
                </p>
              </div>

              {/* Big Profit Highlight */}
              <div className="text-left sm:text-right bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 min-w-[170px] backdrop-blur-md">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                  Lucro Líquido Real
                </span>
                <div className={`text-2xl sm:text-3xl font-black ${
                  result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {formatCurrencyBRL(result.netProfit)}
                </div>
                <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                  <span className="text-xs text-slate-400">Margem Líquida:</span>
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
                    result.netMargin >= 25 ? 'bg-emerald-500/20 text-emerald-300' :
                    result.netMargin >= 15 ? 'bg-amber-500/20 text-amber-300' :
                    'bg-rose-500/20 text-rose-300'
                  }`}>
                    {formatPercentBR(result.netMargin)}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Revenue Allocation Bar */}
            <div className="mt-6 pt-5 border-t border-slate-800/60">
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span>Distribuição do Preço de Venda ({formatCurrencyBRL(result.grossRevenue)})</span>
                <span className="text-[11px] text-slate-400">ROAS de Equilíbrio: <strong>{result.breakEvenRoas > 0 ? `${result.breakEvenRoas.toFixed(2)}x` : 'N/A'}</strong></span>
              </div>

              <div className="h-4 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 p-0.5">
                {/* Produto + Frete */}
                <div 
                  style={{ width: `${costPct}%` }} 
                  className="bg-blue-500 h-full rounded-l-full transition-all"
                  title={`Mercadoria & Frete: ${costPct.toFixed(1)}%`}
                />
                {/* CPA */}
                <div 
                  style={{ width: `${adsPct}%` }} 
                  className="bg-purple-500 h-full transition-all"
                  title={`Tráfego Pago (CPA): ${adsPct.toFixed(1)}%`}
                />
                {/* Gateway & Impostos */}
                <div 
                  style={{ width: `${taxesPct}%` }} 
                  className="bg-amber-500 h-full transition-all"
                  title={`Impostos & Gateway: ${taxesPct.toFixed(1)}%`}
                />
                {/* Lucro Líquido */}
                {result.netProfit > 0 && (
                  <div 
                    style={{ width: `${netProfitPct}%` }} 
                    className="bg-emerald-400 h-full rounded-r-full transition-all"
                    title={`Lucro Líquido: ${netProfitPct.toFixed(1)}%`}
                  />
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  Mercadoria ({costPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  CPA Anúncios ({adsPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  Taxas ({taxesPct.toFixed(0)}%)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  Lucro Real ({netProfitPct.toFixed(0)}%)
                </span>
              </div>
            </div>

          </div>

          {/* DISCRIMINAÇÃO FISCAL DA REMESSA CONFORME (CRITICAL REQUIREMENT #1) */}
          {isRemessaConforme && (
            <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Impacto Fiscal Discriminado (Remessa Conforme)
                </h4>
                <span className="text-[11px] text-blue-300/80 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
                  Desembaraço Expresso
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    Imposto Importação Federal (20%)
                  </span>
                  <span className="text-sm font-bold text-slate-100">
                    {formatCurrencyBRL(result.remessaConformeImportTax)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Sobre produto + frete</span>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                    ICMS Estadual (17% por dentro)
                  </span>
                  <span className="text-sm font-bold text-slate-100">
                    {formatCurrencyBRL(result.remessaConformeIcms)}
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Alíquota uniforme nacional</span>
                </div>

                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-800/40">
                  <span className="text-[10px] text-blue-300 uppercase tracking-wide block">
                    Custo Fiscal Total
                  </span>
                  <span className="text-sm font-bold text-blue-300">
                    +{formatCurrencyBRL(result.remessaConformeTotalTax)}
                  </span>
                  <span className="text-[10px] text-blue-400/80 block mt-0.5">Adicionado ao custo do pedido</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Deductions Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h4 className="font-semibold text-xs text-slate-300 uppercase tracking-wider mb-2">
              Demonstrativo de Resultado do Exercício (DRE por Pedido)
            </h4>

            <div className="divide-y divide-slate-800/80 text-xs">
              
              {/* Faturamento */}
              <div className="py-2 flex items-center justify-between font-semibold text-slate-100">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  (+) Faturamento Bruto (Receita da Venda)
                </span>
                <span className="text-emerald-400 text-sm">{formatCurrencyBRL(result.grossRevenue)}</span>
              </div>

              {/* Custo Fornecedor + Frete */}
              <div className="py-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 pl-4">
                  (-) Custo da Mercadoria & Frete
                </span>
                <span className="text-rose-400 font-medium">-{formatCurrencyBRL(result.totalProductAndFreightCost)}</span>
              </div>

              {/* Imposto Simples/MEI */}
              <div className="py-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 pl-4">
                  (-) Imposto sobre Faturamento ({taxPercent}%)
                </span>
                <span className="text-rose-400 font-medium">-{formatCurrencyBRL(result.taxDeduction)}</span>
              </div>

              {/* Gateway de Pagamento */}
              <div className="py-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 pl-4">
                  (-) Taxa Gateway de Pagamento ({gatewayFeePercent}% + R$ {gatewayFeeFixed})
                </span>
                <span className="text-rose-400 font-medium">-{formatCurrencyBRL(result.gatewayDeduction)}</span>
              </div>

              {/* CPA de Anúncios */}
              <div className="py-2 flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2 pl-4">
                  (-) Tráfego Pago / Anúncios por Venda (CPA)
                </span>
                <span className="text-rose-400 font-medium">-{formatCurrencyBRL(result.cpaCost)}</span>
              </div>

              {/* Custo Operacional Consolidado */}
              <div className="py-2.5 flex items-center justify-between font-medium text-slate-400 bg-slate-950/40 px-3 rounded-xl mt-1">
                <span>(=) Custo Operacional Total Consolidado</span>
                <span className="text-slate-200 font-semibold">{formatCurrencyBRL(result.totalOperatingCost)}</span>
              </div>

              {/* Lucro Final */}
              <div className="pt-3 pb-1 flex items-center justify-between font-bold text-sm">
                <span className="text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  (=) Lucro Líquido Real no Bolso
                </span>
                <span className={`text-base ${result.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {formatCurrencyBRL(result.netProfit)} ({formatPercentBR(result.netMargin)})
                </span>
              </div>

            </div>

          </div>

          {/* CTA to AI Generator */}
          {onNavigateToAi && (
            <div className="p-4 bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Pronto para anunciar este produto?</h4>
                  <p className="text-[11px] text-slate-400">Gere a copy comercial e roteiro de vídeo de 15s para testar no Meta Ads</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigateToAi(activeProductName)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Gerar Oferta com IA
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
