import nextEnv from '@next/env';
import { searchTavily, SearchError } from '../lib/tavily-search.ts';
nextEnv.loadEnvConfig(process.cwd());
const key = process.env.TAVILY_API_KEY;
if (!key) {
  console.log(JSON.stringify({ ok: false, message: 'Configure TAVILY_API_KEY em .env.local e salve o arquivo.' }));
  process.exitCode = 1;
} else {
  try {
    const data = await searchTavily('fornecedor camiseta sob demanda', 'suppliers', key);
    console.log(JSON.stringify({ ok: true, provider: 'Tavily', sources: data.results.length, message: 'Consulta concluída; confira as fontes pelo aplicativo.' }));
  } catch (err) {
    console.log(JSON.stringify({ ok: false, status: err instanceof SearchError ? err.status : 502, message: err instanceof SearchError ? err.message : 'Resposta inválida.' }));
    process.exitCode = 1;
  }
}
