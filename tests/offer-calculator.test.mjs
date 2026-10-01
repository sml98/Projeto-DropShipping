import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSource } from '../lib/research-report.ts';
import { getExchangeRates } from '../lib/exchange-rates.ts';
import { simulateOffer, DEFAULT_OFFER_ASSUMPTIONS } from '../lib/offer-calculator.ts';
const fixture = { title: 'Fixture', url: 'https://example.com/product', description: '' };
test('explicit currencies retain original value and ambiguous symbols never become BRL', () => {
  const source = analyzeSource({ ...fixture, description: 'USD 10.00; € 12,50; CNY 40.00; R$ 50,00; $ 20.00; ¥ 100' }, 'suppliers');
  assert.deepEqual(source.prices.map(p => p.currency), ['USD', 'EUR', 'CNY', 'BRL', 'UNKNOWN', 'UNKNOWN']);
  assert.equal(source.prices[0].brlValue, null); assert.equal(source.prices[3].brlValue, 50);
  assert.equal(simulateOffer(source.prices[4], DEFAULT_OFFER_ASSUMPTIONS), null);
});
test('minimum order, installments, shipping and bulk offers are excluded from unit scenarios', () => {
  for (const description of ['Min. R$ 3.180', 'Pedido mínimo de R$ 700,00', '3x de R$ 43,30', 'Frete R$ 20,00', 'Kit com 10 unidades por R$ 100,00']) {
    const price = analyzeSource({ ...fixture, description }, 'suppliers').prices[0];
    assert.equal(simulateOffer(price, DEFAULT_OFFER_ASSUMPTIONS), null, description);
  }
});
test('automatic sale target includes every configured cost and never claims observed market price', () => {
  const price = analyzeSource({ ...fixture, description: 'R$ 50,00' }, 'suppliers').prices[0];
  const settings = { ...DEFAULT_OFFER_ASSUMPTIONS, freight: 10, cpa: 20, otherCosts: 5, gatewayFeeFixed: 2, gatewayFeePercent: 5, taxPercent: 6, importTaxAmount: 8 };
  const result = simulateOffer(price, settings);
  assert.ok(Math.abs(result.netMargin - 30) < 0.01);
  assert.equal(result.totalProductAndFreightCost, 68);
  assert.equal(result.cpaCost, 20); assert.equal(result.otherCosts, 5);
  assert.equal(simulateOffer(price, { ...settings, targetMarginPercent: 95 }), null);
});
test('exchange validates pair, freshness and deduplicates requests without inventing missing rates', async () => {
  let calls = 0;
  const date = new Date().toISOString().slice(0, 10);
  const result = await getExchangeRates(['USD', 'USD', 'BRL', 'EUR'], async url => {
    calls++;
    return url.includes('/usd/') ? Response.json({ base: 'USD', quote: 'BRL', date, rate: 5.2 }) : Response.json({ base: 'EUR', quote: 'BRL', date: '2020-01-01', rate: 6 });
  });
  assert.equal(calls, 2); assert.equal(result.rates.length, 1); assert.deepEqual(result.missing, ['EUR']);
});
