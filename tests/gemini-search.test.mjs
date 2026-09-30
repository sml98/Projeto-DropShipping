import test from 'node:test';
import assert from 'node:assert/strict';
import { geminiSearchRequest, extractGroundedSearch, searchGemini } from '../lib/gemini-search.ts';
const groundedFixture = { candidates: [{ groundingMetadata: { webSearchQueries: ['camiseta Brasil'], groundingChunks: [{ web: { title: 'Fixture source', uri: 'https://example.com/item' } }, { web: { title: 'unsafe', uri: 'javascript:alert(1)' } }], searchEntryPoint: { renderedContent: '<div>Fixture Google suggestions</div>' } } }] };
test('search makes exactly one Gemini 3.5 Flash-Lite call with Google Search using the same key', async () => {
  let calls = 0;
  const result = await searchGemini('camiseta', 'products', 'test-key', async params => {
    calls++; assert.equal(params.model, 'gemini-3.5-flash-lite');
    assert.deepEqual(params.config.tools, [{ googleSearch: {} }]);
    assert.equal(params.config.httpOptions.retryOptions.attempts, 1);
    assert.equal(params.config.responseMimeType, undefined);
    assert.equal(params.config.thinkingConfig.thinkingLevel, 'MINIMAL');
    assert.equal(params.config.thinkingConfig.thinkingBudget, undefined);
    return groundedFixture;
  });
  assert.equal(calls, 1); assert.equal(result.results.length, 1);
  assert.equal(result.results[0].url, 'https://example.com/item');
  assert.equal(result.results[0].description, '');
  assert.equal(result.searchSuggestionsHtml, '<div>Fixture Google suggestions</div>');
  assert.deepEqual(JSON.parse(geminiSearchRequest('pet', 'suppliers').contents), { query: 'pet', kind: 'suppliers', country: 'Brasil' });
});
test('model-generated URLs or text cannot replace actual grounding metadata', () => {
  assert.throws(() => extractGroundedSearch({ candidates: [{ content: { parts: [{ text: 'Fornecedor https://example.com' }] } }] }), /fontes válidas/);
  assert.throws(() => extractGroundedSearch({ candidates: [{ groundingMetadata: { groundingChunks: groundedFixture.candidates[0].groundingMetadata.groundingChunks } }] }), /fontes válidas/);
  assert.throws(() => extractGroundedSearch({ candidates: [{ groundingMetadata: { webSearchQueries: ['pet'], groundingChunks: [{ web: { title: 'unsafe', uri: 'javascript:alert(1)' } }] } }] }), /fontes válidas/);
});
test('quota errors stop the search without retry or another provider', async () => {
  let calls = 0;
  await assert.rejects(searchGemini('pet', 'products', 'test', async () => { calls++; throw Object.assign(new Error('quota'), { status: 429 }); }), /quota/);
  assert.equal(calls, 1);
});
