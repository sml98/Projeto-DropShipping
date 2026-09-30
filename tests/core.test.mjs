import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFeasibility } from '../lib/calculator.ts';
import { normalizeResults, safeWebUrl } from '../lib/research.ts';
const base = { cost: 40, freight: 10, sellingPrice: 100, cpa: 10, isRemessaConforme: false, gatewayFeePercent: 0, gatewayFeeFixed: 0, taxPercent: 0 };
test('zero fees are respected and no statutory taxes are assumed', () => {
  const r = calculateFeasibility(base); assert.equal(r.netProfit, 40); assert.equal(r.gatewayDeduction, 0); assert.equal(r.taxDeduction, 0); assert.equal(r.breakEvenRoas, 2);
});
test('actual import quote and operating costs enter profitability and break-even', () => {
  const r = calculateFeasibility({ ...base, isRemessaConforme: true, importTaxAmount: 20, otherCosts: 5 }); assert.equal(r.netProfit, 15); assert.equal(r.remessaConformeTotalTax, 20); assert.equal(r.breakEvenRoas, 4);
});
test('no possible advertising break-even is represented as null', () => { assert.equal(calculateFeasibility({ ...base, cost: 120 }).breakEvenRoas, null); });
test('a positive narrow margin is not called loss-making', () => { assert.equal(calculateFeasibility({ ...base, cpa: 45 }).verdict, 'moderado'); });
test('research only uses safe, unique source links and treats snippets as text', () => {
  assert.equal(safeWebUrl('javascript:alert(1)'), null); assert.equal(safeWebUrl('https://user:pass@example.com'), null);
  assert.deepEqual(normalizeResults([{ url: 'https://example.com', title: '<b>Source</b>', description: '<em>Text</em>' }, { url: 'https://example.com', title: 'duplicate' }, { url: 'javascript:alert(1)', title: 'bad' }]), [{ url: 'https://example.com/', title: 'Source', description: 'Text' }]);
});
import { validateBackup } from '../lib/backup.ts';
test('backup restore rejects malformed data and unsafe source URLs', () => {
  assert.throws(() => validateBackup({ version: 2, dropradar_products_v2: [{}], dropradar_suppliers_v2: [], dropradar_checklist_v1: [] }));
  assert.throws(() => validateBackup({ version: 1 }));
  assert.deepEqual(validateBackup({ version: 2, dropradar_products_v2: [], dropradar_suppliers_v2: [], dropradar_checklist_v1: [] }).dropradar_products_v2, []);
});
test('calculator rejects non-finite values and invalid percentage rates', () => {
  assert.throws(() => calculateFeasibility({ ...base, cost: Infinity }));
  assert.throws(() => calculateFeasibility({ ...base, taxPercent: 101 }));
});
import { buildResearchLinks } from '../lib/research.ts';
test('free searches encode user input and target real public search pages', () => {
  const query = 'tênis & rodinha #infantil';
  const links = buildResearchLinks(query, 'products');
  assert.equal(links.length, 3);
  assert.equal(new URL(links[0].url).searchParams.get('q'), query + ' produto preço Brasil');
  assert.equal(new URL(links[1].url).hostname, 'duckduckgo.com');
  assert.equal(decodeURIComponent(new URL(links[2].url).pathname.slice(1)), query);
  assert.match(new URL(buildResearchLinks('calçados', 'suppliers')[0].url).searchParams.get('q'), /fornecedor dropshipping site oficial Brasil/);
});
