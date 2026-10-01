import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeOpportunity, calculateOfferMetrics } from '../lib/opportunity-engine.ts';
import { DEMO_PRODUCTS, DEMO_SUPPLIERS } from '../lib/data/commerceDemo.ts';

test('landed cost includes every configured supplier charge and operating reserve', () => {
  const product = DEMO_PRODUCTS[0];
  const offer = product.offers[0];
  const metrics = calculateOfferMetrics(product, offer);
  assert.equal(metrics.landedCost, offer.unitCost + offer.freight + offer.importCharges + offer.exchangeCharges + offer.paymentFees + offer.otherCosts);
  assert.ok(metrics.expectedProfit < product.targetPrice - metrics.landedCost);
  assert.ok(metrics.marginPercent > 0);
});

test('opportunity analysis compares origins and blocks unknown media rights', () => {
  const product = { ...DEMO_PRODUCTS[0], mediaRights: 'unknown' };
  const analysis = analyzeOpportunity(product, DEMO_SUPPLIERS);
  assert.ok(analysis.nationalOfferId);
  assert.ok(analysis.internationalOfferId);
  assert.ok(analysis.blockers.some(item => item.includes('mídia')));
  assert.ok(analysis.opportunityScore >= 0 && analysis.opportunityScore <= 100);
});

test('a documented offer can be selected without claiming the supplier was audited', () => {
  const product = DEMO_PRODUCTS[0];
  const analysis = analyzeOpportunity(product, DEMO_SUPPLIERS);
  const supplier = DEMO_SUPPLIERS.find(item => product.offers.some(offer => offer.id === analysis.bestOfferId && offer.supplierId === item.id));
  assert.ok(analysis.bestOfferId);
  assert.notEqual(supplier?.verification, 'audited');
});

