import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTavily, tavilySearchBody } from '../lib/tavily.ts';
test('Tavily request stays basic and never enables generated answers or auto upgrade', async () => {
  const results = await searchTavily('camiseta', 'products', 'test-key', async (url, options) => {
    assert.equal(url, 'https://api.tavily.com/search');
    assert.equal(options.headers.Authorization, 'Bearer test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.search_depth, 'basic'); assert.equal(body.auto_parameters, false); assert.equal(body.include_answer, false);
    return Response.json({ answer: 'Must not appear', results: [{ title: 'Test fixture', url: 'https://example.com/item', content: 'Source excerpt' }, { title: 'unsafe', url: 'javascript:alert(1)' }] });
  });
  assert.deepEqual(results, [{ title: 'Test fixture', url: 'https://example.com/item', description: 'Source excerpt' }]);
  assert.match(tavilySearchBody('pet', 'suppliers').query, /fornecedor/);
});
test('Tavily quota and malformed responses never become fake success', async () => {
  for (const status of [429, 432, 433]) await assert.rejects(searchTavily('pet', 'products', 'test', async () => new Response('', { status })), /Cota ou limite/);
  await assert.rejects(searchTavily('pet', 'products', 'test', async () => Response.json({})), /lista válida/);
});
