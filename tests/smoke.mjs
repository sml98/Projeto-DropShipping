import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import assert from 'node:assert/strict';
const token = randomBytes(32).toString('hex');
const port = 3197;
const base = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-H', '127.0.0.1', '-p', String(port)], { env: { ...process.env, APP_ACCESS_TOKEN: token, BRAVE_SEARCH_API_KEY: '', GEMINI_API_KEY: '' }, stdio: 'ignore' });
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try { const r = await fetch(base); if (r.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, 'Production server must start');
  const post = (path, body, access = token) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${access}` }, body: JSON.stringify(body) });
  assert.equal((await post('/api/pesquisar', { query: 'camiseta', kind: 'products' }, 'invalid')).status, 401);
  assert.equal((await post('/api/pesquisar', { query: '', kind: 'products' })).status, 400);
  const search = await post('/api/pesquisar', { query: 'camiseta', kind: 'products' });
  assert.equal(search.status, 503); assert.match((await search.json()).error, /BRAVE_SEARCH_API_KEY/);
  const offer = await post('/api/gerar-oferta', { productName: 'Camiseta', keyFeature: 'Algodão conforme cotação', niche: 'Moda', audience: 'Adultos' });
  assert.equal(offer.status, 503); assert.match((await offer.json()).error, /GEMINI_API_KEY/);
  assert.equal((await post('/api/pesquisar', { query: 'a'.repeat(9000), kind: 'products' })).status, 400);
  for (let i = 0; i < 27; i++) await post('/api/pesquisar', { query: 'camiseta', kind: 'products' });
  assert.equal((await post('/api/pesquisar', { query: 'camiseta', kind: 'products' })).status, 429);
  console.log('Production smoke passed: homepage, auth, input limits, missing credentials, quota. No live provider calls.');
} finally { child.kill('SIGTERM'); }
