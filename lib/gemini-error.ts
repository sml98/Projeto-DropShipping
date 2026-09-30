type ErrorFields = { status?: unknown; statusCode?: unknown; code?: unknown; name?: unknown; message?: unknown; cause?: { code?: unknown }; error?: { code?: unknown; message?: unknown; status?: unknown } };
export function diagnoseGeminiError(value: unknown, secrets: string[] = []) {
  const error = value && typeof value === 'object' ? value as ErrorFields : {};
  let payload = error.error;
  if (typeof error.message === 'string') {
    try { const parsed = JSON.parse(error.message); payload = parsed.error || parsed; } catch {}
  }
  const numeric = [error.status, error.statusCode, payload?.code, error.code].map(Number).find(n => Number.isInteger(n) && n >= 400 && n <= 599);
  let detail = typeof payload?.message === 'string' ? payload.message : typeof error.message === 'string' ? error.message : '';
  for (const secret of secrets.filter(Boolean)) detail = detail.split(secret).join('[oculto]');
  detail = detail.replace(/(?:https?:\/\/[^\s"'<>]+)/gi, '[URL omitida]').replace(/\b[A-Za-z0-9_.-]{32,}\b/g, '[oculto]').replace(/[\r\n\t]+/g, ' ').slice(0, 600);
  const clue = `${error.name || ''} ${detail} ${error.cause?.code || ''}`;
  let category = 'UNKNOWN'; let message = 'A chamada ao Gemini falhou.';
  if (/fontes válidas/.test(detail)) { category = 'NO_GROUNDING'; message = 'O Gemini respondeu sem pesquisa web com fontes válidas.'; }
  else if (/API_KEY_INVALID|api key not valid|invalid api key|leaked|blocked.*key/i.test(clue)) { category = 'KEY_REJECTED'; message = 'O Google rejeitou a chave Gemini. Confira a chave e seu status no AI Studio.'; }
  else if (numeric === 429) { category = 'QUOTA'; message = 'Cota ou limite do Gemini atingido. Aguarde a renovação; não é necessário contratar um plano.'; }
  else if (numeric === 401 || numeric === 403) { category = 'ACCESS'; message = 'O Google recusou o acesso. Confira as permissões e restrições da chave/projeto.'; }
  else if (numeric === 404) { category = 'MODEL_UNAVAILABLE'; message = 'gemini-2.5-flash não está disponível para essa chamada. Nenhum outro modelo foi chamado.'; }
  else if (numeric === 400) { category = 'REQUEST_REJECTED'; message = 'O Google rejeitou a configuração da chamada. O detalhe abaixo permite identificar o parâmetro.'; }
  else if (numeric === 500 || numeric === 503) { category = 'PROVIDER_UNAVAILABLE'; message = 'O serviço Gemini está indisponível ou com erro temporário.'; }
  else if (/timeout|timed out|AbortError|ETIMEDOUT/i.test(clue)) { category = 'TIMEOUT'; message = 'A chamada Gemini excedeu o tempo limite. Confira a conexão e tente novamente.'; }
  else if (/fetch failed|ENOTFOUND|EAI_AGAIN|ECONN|certificate|network|connect/i.test(clue)) { category = 'CONNECTION'; message = 'Falha de conexão com o Google. Confira internet, DNS e certificados do Termux.'; }
  return { category, providerStatus: numeric || null, message, detail, httpStatus: category === 'QUOTA' ? 429 : 502 };
}
