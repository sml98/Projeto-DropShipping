import nextEnv from '@next/env';
import { searchGemini, GEMINI_MODEL } from '../lib/gemini-search.ts';
import { diagnoseGeminiError } from '../lib/gemini-error.ts';
nextEnv.loadEnvConfig(process.cwd());
const key = process.env.GEMINI_API_KEY;
if (!key || key === 'MY_GEMINI_API_KEY') {
  console.log(JSON.stringify({ category: 'MISSING_KEY', message: 'Configure GEMINI_API_KEY em .env.local e salve o arquivo.' }));
  process.exitCode = 1;
} else {
  try {
    const data = await searchGemini('tênis infantil de rodinha', 'products', key);
    console.log(JSON.stringify({ ok: true, model: GEMINI_MODEL, sources: data.results.length, message: 'Chave e pesquisa Google Search funcionaram nesta consulta.' }));
  } catch (err) {
    const { category, providerStatus, message, detail } = diagnoseGeminiError(err, [key, process.env.APP_ACCESS_TOKEN || '']);
    console.log(JSON.stringify({ ok: false, model: GEMINI_MODEL, category, providerStatus, message, detail }));
    process.exitCode = 1;
  }
}
