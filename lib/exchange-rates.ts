export type Currency = 'BRL' | 'USD' | 'EUR' | 'GBP' | 'CNY';
export interface ExchangeRate { currency: Currency; rate: number; date: string; sourceUrl: string }
export async function getExchangeRates(currencies: Currency[], request: typeof fetch = fetch) {
  const unique = [...new Set(currencies)].filter(c => c !== 'BRL');
  const results = await Promise.allSettled(unique.map(async currency => {
    const sourceUrl = `https://api.frankfurter.dev/v2/rate/${currency.toLowerCase()}/brl`;
    const response = await request(sourceUrl, { signal: AbortSignal.timeout(15000), cache: 'no-store', redirect: 'error' });
    if (!response.ok) throw new Error('Cotação indisponível');
    const data = await response.json();
    if (String(data.base).toUpperCase() !== currency || String(data.quote).toUpperCase() !== 'BRL' || typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0 || typeof data.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) throw new Error('Cotação inválida');
    const age = Date.now() - Date.parse(data.date + 'T00:00:00Z');
    if (!Number.isFinite(age) || age < -86400000 || age > 7 * 86400000) throw new Error('Cotação antiga');
    return { currency, rate: data.rate, date: data.date, sourceUrl } satisfies ExchangeRate;
  }));
  return { rates: results.flatMap(r => r.status === 'fulfilled' ? [r.value] : []), missing: unique.filter((_, i) => results[i].status === 'rejected') };
}
