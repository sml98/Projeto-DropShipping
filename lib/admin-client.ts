import type { CommerceOrder, CommerceProduct, CommerceSupplier, CreativeDraft, IntegrationStatus } from './commerce-types';

export interface AdminState {
  products: CommerceProduct[];
  suppliers: CommerceSupplier[];
  creatives: CreativeDraft[];
  orders: CommerceOrder[];
  integrations: IntegrationStatus[];
}

export async function loadAdminState(token: string): Promise<AdminState> {
  const response = await fetch('/api/admin/state', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível carregar os dados do servidor.');
  return data as AdminState;
}

export async function adminWrite(token: string, body: Record<string, unknown>) {
  const response = await fetch('/api/admin/state', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Não foi possível salvar no servidor.');
  return data;
}
