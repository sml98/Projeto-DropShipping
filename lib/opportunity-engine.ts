import type {
  CommerceProduct,
  CommerceSupplier,
  OfferMetrics,
  OpportunityAnalysis,
  SupplierOffer,
} from "./commerce-types";

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 100) / 100;

export function calculateOfferMetrics(
  product: CommerceProduct,
  offer: SupplierOffer,
): OfferMetrics {
  const landedCost =
    offer.unitCost +
    offer.freight +
    offer.importCharges +
    offer.exchangeCharges +
    offer.paymentFees +
    offer.otherCosts;
  const taxAmount = product.targetPrice * (product.taxPercent / 100);
  const riskReserve = product.targetPrice * (offer.returnRiskPercent / 100);
  const expectedProfit =
    product.targetPrice -
    landedCost -
    taxAmount -
    product.estimatedCpa -
    riskReserve;
  const marginPercent =
    product.targetPrice > 0 ? (expectedProfit / product.targetPrice) * 100 : 0;
  const contributionBeforeAds =
    product.targetPrice - landedCost - taxAmount - riskReserve;
  const breakEvenRoas =
    contributionBeforeAds > 0
      ? product.targetPrice / contributionBeforeAds
      : null;
  return {
    landedCost: round(landedCost),
    taxAmount: round(taxAmount),
    riskReserve: round(riskReserve),
    expectedProfit: round(expectedProfit),
    marginPercent: round(marginPercent),
    breakEvenRoas: breakEvenRoas == null ? null : round(breakEvenRoas),
  };
}

function supplierReliability(supplier: CommerceSupplier | undefined) {
  if (!supplier) return 0;
  const verification = {
    unverified: 10,
    documented: 45,
    "sample-tested": 75,
    audited: 95,
  }[supplier.verification];
  const operational =
    [
      supplier.invoiceConfirmed,
      supplier.returnsConfirmed,
      supplier.trackingConfirmed,
    ].filter(Boolean).length * 8;
  const evidence = Math.min(12, supplier.evidence.length * 4);
  const reputation =
    supplier.rating != null && supplier.reviewsCount
      ? (supplier.rating / 5) * 8 +
        Math.min(8, Math.log10(supplier.reviewsCount + 1) * 3)
      : 0;
  return clamp(verification + operational + evidence + reputation);
}

function scoreOffer(
  product: CommerceProduct,
  offer: SupplierOffer,
  supplier: CommerceSupplier | undefined,
) {
  const metrics = calculateOfferMetrics(product, offer);
  const economics = clamp((metrics.marginPercent - 5) * 3.1);
  const midpoint = (offer.deliveryMinDays + offer.deliveryMaxDays) / 2;
  const logistics = clamp(
    100 -
      midpoint * 3 -
      (offer.stock === 0 ? 80 : offer.stock == null ? 20 : 0) -
      (offer.minOrder > 1 ? 20 : 0),
  );
  const reliability = supplierReliability(supplier);
  return {
    metrics,
    economics,
    logistics,
    reliability,
    total: economics * 0.48 + logistics * 0.22 + reliability * 0.3,
  };
}

export function analyzeOpportunity(
  product: CommerceProduct,
  suppliers: CommerceSupplier[],
): OpportunityAnalysis {
  const ranked = product.offers
    .map((offer) => ({
      offer,
      ...scoreOffer(
        product,
        offer,
        suppliers.find((s) => s.id === offer.supplierId),
      ),
    }))
    .sort((a, b) => b.total - a.total);
  const best = ranked[0];
  const national = ranked.find(
    (item) =>
      suppliers.find((s) => s.id === item.offer.supplierId)?.origin ===
      "national",
  );
  const international = ranked.find(
    (item) =>
      suppliers.find((s) => s.id === item.offer.supplierId)?.origin ===
      "international",
  );
  const reviewConfidence = Math.min(
    1,
    Math.log10(product.demand.reviewCount + 1) / 3,
  );
  const demandScore = clamp(
    product.demand.searchMomentum * 0.35 +
      product.demand.socialMomentum * 0.35 +
      product.demand.reviewQuality * 20 * reviewConfidence * 0.2 +
      Math.min(100, product.demand.evidenceCount * 20) * 0.1,
  );
  const creativeScore = clamp(
    45 +
      product.tags.length * 8 +
      (product.mediaRights === "unknown" ? -40 : 20),
  );
  const blockers: string[] = [];
  const warnings: string[] = [];
  if (!best) blockers.push("Nenhuma oferta cadastrada.");
  if (best && best.metrics.marginPercent < 15)
    blockers.push("Margem esperada abaixo de 15%.");
  if (best && best.offer.stock === 0) blockers.push("Oferta sem estoque.");
  if (best && best.offer.stock == null)
    blockers.push("Estoque ainda não foi confirmado.");
  if (best && best.offer.deliveryMinDays <= 0)
    blockers.push("Prazo de entrega ainda não foi confirmado.");
  if (best && best.offer.provider === "cj" && best.offer.freight <= 0)
    blockers.push("Frete internacional ainda não foi calculado.");
  if (
    best &&
    suppliers.find((item) => item.id === best.offer.supplierId)
      ?.verification === "unverified"
  )
    blockers.push("Fornecedor ainda não foi documentado.");
  if (product.mediaRights === "unknown")
    blockers.push("Direito de uso da mídia não confirmado.");
  if (product.media?.some((item) => item.rights === "unknown"))
    blockers.push("Uma ou mais mídias ainda não têm licença confirmada.");
  if (!product.demand.evidenceCount)
    blockers.push("Sem evidências de demanda.");
  if (best && !best.offer.apiSynced)
    warnings.push("Preço e estoque dependem de verificação manual.");
  if (best && best.offer.deliveryMaxDays > 20)
    warnings.push("Prazo máximo acima de 20 dias.");
  const economicsScore = best?.economics ?? 0;
  const supplierScore = best?.reliability ?? 0;
  const logisticsScore = best?.logistics ?? 0;
  const opportunityScore = clamp(
    economicsScore * 0.3 +
      demandScore * 0.25 +
      supplierScore * 0.2 +
      logisticsScore * 0.15 +
      creativeScore * 0.1 -
      blockers.length * 15,
  );
  return {
    productId: product.id,
    bestOfferId: best?.offer.id,
    nationalOfferId: national?.offer.id,
    internationalOfferId: international?.offer.id,
    opportunityScore: Math.round(opportunityScore),
    economicsScore: Math.round(economicsScore),
    demandScore: Math.round(demandScore),
    supplierScore: Math.round(supplierScore),
    logisticsScore: Math.round(logisticsScore),
    creativeScore: Math.round(creativeScore),
    blockers,
    warnings,
  };
}

export function selectBestOffer(
  product: CommerceProduct,
  suppliers: CommerceSupplier[],
) {
  const analysis = analyzeOpportunity(product, suppliers);
  return product.offers.find(
    (offer) => offer.id === (product.selectedOfferId || analysis.bestOfferId),
  );
}
