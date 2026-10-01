import { calculateFeasibility } from './calculator.ts';
import type { PriceEvidence } from './research-report.ts';
export interface OfferAssumptions {
  freight: number; cpa: number; otherCosts: number; gatewayFeePercent: number;
  gatewayFeeFixed: number; taxPercent: number; importTaxAmount: number;
  exchangeSpreadPercent: number; targetMarginPercent: number;
}
export const DEFAULT_OFFER_ASSUMPTIONS: OfferAssumptions = {
  freight: 0, cpa: 0, otherCosts: 0, gatewayFeePercent: 0, gatewayFeeFixed: 0,
  taxPercent: 0, importTaxAmount: 0, exchangeSpreadPercent: 0, targetMarginPercent: 30,
};
export function simulateOffer(price: PriceEvidence, settings: OfferAssumptions) {
  if (price.brlValue == null || price.installment || price.nonProductCharge || price.bulk || price.minimum) return null;
  if (Object.values(settings).some(v => !Number.isFinite(v) || v < 0)) return null;
  const denominator = 1 - (settings.gatewayFeePercent + settings.taxPercent + settings.targetMarginPercent) / 100;
  if (denominator <= 0 || settings.exchangeSpreadPercent > 100) return null;
  const cost = price.brlValue * (price.currency !== 'BRL' ? 1 + settings.exchangeSpreadPercent / 100 : 1);
  const fixed = cost + settings.freight + settings.cpa + settings.otherCosts + settings.gatewayFeeFixed + settings.importTaxAmount;
  const sellingPrice = Math.ceil(fixed / denominator * 100) / 100;
  const calculation = calculateFeasibility({ cost, freight: settings.freight, sellingPrice, cpa: settings.cpa, isRemessaConforme: true, importTaxAmount: settings.importTaxAmount, otherCosts: settings.otherCosts, gatewayFeePercent: settings.gatewayFeePercent, gatewayFeeFixed: settings.gatewayFeeFixed, taxPercent: settings.taxPercent });
  return { cost, sellingPrice, ...calculation };
}
