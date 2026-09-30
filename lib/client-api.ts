export async function privateFetch(url: string, body: unknown) {
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${sessionStorage.getItem('dropradar_access') || ''}` }, body: JSON.stringify(body) });
}
