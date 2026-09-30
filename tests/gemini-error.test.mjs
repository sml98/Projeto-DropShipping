import test from 'node:test';
import assert from 'node:assert/strict';
import { diagnoseGeminiError } from '../lib/gemini-error.ts';
test('provider errors distinguish invalid key, model, quota and request rejection', () => {
  assert.equal(diagnoseGeminiError({ status: 400, message: JSON.stringify({ error: { code: 400, message: 'API key not valid. Please pass a valid API key.' } }) }).category, 'KEY_REJECTED');
  assert.equal(diagnoseGeminiError({ statusCode: 404, message: 'model unavailable' }).category, 'MODEL_UNAVAILABLE');
  assert.equal(diagnoseGeminiError({ message: JSON.stringify({ error: { code: 429, message: 'quota' } }) }).httpStatus, 429);
  assert.equal(diagnoseGeminiError({ status: 400, message: 'invalid configuration' }).category, 'REQUEST_REJECTED');
  assert.equal(diagnoseGeminiError({ status: 403 }).category, 'ACCESS');
});
test('diagnostics distinguish network, timeout and absent sources', () => {
  assert.equal(diagnoseGeminiError(new Error('fetch failed')).category, 'CONNECTION');
  assert.equal(diagnoseGeminiError({ message: 'failed', cause: { code: 'ENOTFOUND' } }).category, 'CONNECTION');
  assert.equal(diagnoseGeminiError({ name: 'AbortError', message: 'aborted' }).category, 'TIMEOUT');
  assert.equal(diagnoseGeminiError(new Error('O Gemini não retornou pesquisa web com fontes válidas.')).category, 'NO_GROUNDING');
});
test('diagnostics never return configured secrets or request URLs', () => {
  const key = 'private-key-fixture'; const token = 'private-token-fixture';
  const result = diagnoseGeminiError({ status: 400, message: `Failure ${key} ${token} https://example.com/?key=${key}` }, [key, token]);
  assert.ok(!JSON.stringify(result).includes(key)); assert.ok(!JSON.stringify(result).includes(token));
  assert.ok(!result.detail.includes('https://')); assert.ok(result.detail.includes('[oculto]'));
});
