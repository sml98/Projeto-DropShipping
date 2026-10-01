import test from 'node:test';
import assert from 'node:assert/strict';
import { searchTavily, tavilyRequest } from '../lib/tavily-search.ts';
test('basic search makes one authenticated call and uses only valid source records', async () => {
  let calls = 0;
  const data = await searchTavily('pet', 'suppliers', 'fixture-key', async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.tavily.com/search');
    assert.equal(options.headers.Authorization, 'Bearer fixture-key');
    const body = JSON.parse(options.body);
    assert.equal(body.search_depth, 'basic'); assert.equal(body.auto_parameters, false); assert.equal(body.include_answer, false);
    return Response.json({ answer: 'invented', results: [{ title: '<b>Fixture</b>', url: 'https://example.com/', content: 'Source excerpt' }, { title: 'unsafe', url: 'javascript:alert(1)' }, null] });
  });
  assert.equal(calls, 1); assert.deepEqual(data.results, [{ title: 'Fixture', url: 'https://example.com/', description: 'Source excerpt' }]);
});
test('reputation restricts domains without treating snippets as verified ratings', async () => {
  assert.ok(tavilyRequest('Empresa', 'reputation').include_domains.includes('reclameaqui.com.br'));
  const result = await searchTavily('Empresa', 'reputation', 'fixture', async () => Response.json({ results: [
    { title: 'Review', url: 'https://www.trustpilot.com/review/example.com', content: 'Fixture review' },
    { title: 'Impostor', url: 'https://trustpilot.com.evil.example/review', content: 'wrong' },
  ] }));
  assert.equal(result.results.length, 1); assert.equal(result.results[0].rating, undefined);
});
test('quota rejection stops without retries or leaking provider error contents', async () => {
  for (const status of [429, 432, 433]) {
    let calls = 0;
    await assert.rejects(searchTavily('pet', 'products', 'secret', async () => { calls++; return Response.json({ detail: 'secret' }, { status }); }), err => err.status === 429 && !err.message.includes('secret'));
    assert.equal(calls, 1);
  }
});
test('empty result is honest; malformed response is an error', async () => {
  assert.deepEqual(await searchTavily('pet', 'products', 'fixture', async () => Response.json({ results: [] })), { results: [] });
  await assert.rejects(searchTavily('pet', 'products', 'fixture', async () => Response.json({ answer: 'unsupported' })), /sem lista/);
});
