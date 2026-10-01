import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeSource } from '../lib/research-report.ts';
import { researchOpportunity } from '../lib/opportunity-search.ts';
const source = { title: 'Fixture product', url: 'https://example.com/item', description: 'Preço R$ 129,90 ou 3x de R$ 43,30. 120 vendidos. Frete a consultar.' };
test('source analysis preserves price context, distinguishes installments and keeps sales as evidence', () => {
  const result = analyzeSource(source, 'products');
  assert.equal(result.prices[0].value, 129.90);
  assert.equal(result.prices[1].value, 43.30);
  assert.equal(result.prices[1].installment, true);
  assert.ok(result.salesEvidence.some(text => text.includes('120 vendidos')));
  assert.equal(result.monthlySales, undefined); assert.equal(result.profit, undefined);
  assert.equal(analyzeSource({ ...source, description: 'R$ 1.299,90; R$ 1.000; R$ 99,9012' }, 'products').prices[1].value, 1000);
  assert.equal(analyzeSource({ ...source, description: 'R$ 99,9012' }, 'products').prices.length, 0);
});
test('opportunity research reads only selected result URLs and preserves partial extraction failures', async () => {
  const calls = [];
  const result = await researchOpportunity('pet', 'fixture', async (url, options) => {
    const body = JSON.parse(options.body); calls.push({ url, body });
    if (url.endsWith('/search')) return Response.json({ results: [source] });
    assert.ok(body.urls.length <= 5);
    return Response.json({ results: [{ url: source.url, raw_content: 'Dropshipping. Produto R$ 30,00. Mais vendidos.' }, { url: 'https://unrequested.example/', raw_content: 'R$ 1,00' }], failed_results: [] });
  });
  assert.equal(calls.length, 4); assert.equal(calls.filter(call => call.url.endsWith('/search')).length, 3);
  assert.ok(calls.every(call => call.body.search_depth === 'basic' || call.body.extract_depth === 'basic'));
  assert.equal(result.sources[0].prices[0].value, 30); assert.equal(result.sources[0].extracted, true);
  assert.equal(result.sources.some(s => s.url.includes('unrequested')), false);
});
test('missing page data is disclosed and does not stop successful research groups', async () => {
  const report = await researchOpportunity('pet', 'fixture', async (url, options) => {
    if (url.endsWith('/extract')) return Response.json({ results: [], failed_results: [{ url: source.url }] });
    const body = JSON.parse(options.body);
    if (body.query.includes('fabricante')) return Response.json({ results: [] });
    return Response.json({ results: [source] });
  });
  assert.ok(report.warnings.length > 0); assert.ok(report.sources.every(s => !s.extracted));
});
test('all search failures stop after three calls, with no extract or provider fallback', async () => {
  let calls = 0;
  await assert.rejects(researchOpportunity('pet', 'fixture', async () => { calls++; return Response.json({}, { status: 429 }); }), err => err.status === 429);
  assert.equal(calls, 3);
});
