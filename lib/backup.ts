import type { Product, Supplier, ChecklistStage } from '@/types';
const text = (v: unknown): v is string => typeof v === 'string' && v.length <= 10000;
const nonnegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;
const url = (v: unknown): boolean => typeof v === 'string' && /^https:\/\//.test(v) && (() => { try { const u = new URL(v); return !u.username && !u.password; } catch { return false; } })();
export function isProduct(v: unknown): v is Product {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return ['id', 'name', 'category', 'niche', 'originBadge', 'deliveryTime', 'imageUrl', 'supplierName', 'supplierLocation', 'description'].every(k => text(p[k])) && ['nacional', 'internacional'].includes(String(p.origin)) && ['supplierCost', 'suggestedPrice', 'estimatedFreight', 'grossMargin'].every(k => typeof p[k] === 'number' && Number.isFinite(p[k])) && ['supplierCost', 'suggestedPrice', 'estimatedFreight'].every(k => nonnegative(p[k])) && (p.imageUrl === '/product-placeholder.svg' || url(p.imageUrl)) && (p.sourceUrl == null || url(p.sourceUrl)) && (p.painPoints == null || (Array.isArray(p.painPoints) && p.painPoints.every(text)));
}
export function isSupplier(v: unknown): v is Supplier {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return ['id', 'name', 'category', 'location', 'dispatchTime', 'minOrder', 'whatsapp', 'description'].every(k => text(s[k])) && ['nacional', 'internacional'].includes(String(s.origin)) && (s.rating == null || (nonnegative(s.rating) && s.rating <= 5)) && (s.catalogUrl == null || url(s.catalogUrl)) && (s.sourceUrl == null || url(s.sourceUrl));
}
export function isChecklist(v: unknown): v is ChecklistStage {
  if (!v || typeof v !== 'object') return false;
  const s = v as Record<string, unknown>;
  return nonnegative(s.id) && text(s.title) && text(s.subtitle) && Array.isArray(s.tasks) && s.tasks.every(t => t && text(t.id) && text(t.title) && text(t.description) && typeof t.completed === 'boolean' && (t.proTip == null || text(t.proTip)));
}
export function validateBackup(raw: unknown) {
  if (!raw || typeof raw !== 'object') throw new Error('Backup inválido.');
  const b = raw as Record<string, unknown>;
  if (b.version !== 2) throw new Error('Versão de backup não suportada.');
  const validators = { dropradar_products_v2: isProduct, dropradar_suppliers_v2: isSupplier, dropradar_checklist_v1: isChecklist };
  const out: Record<string, unknown[]> = {};
  for (const [key, validate] of Object.entries(validators)) {
    const items = b[key];
    if (!Array.isArray(items) || items.length > 10000 || !items.every(validate)) throw new Error(`Dados inválidos: ${key}`);
    // Import never grants verification or populates market performance metrics.
    out[key] = key === 'dropradar_products_v2' ? items.map(p => ({ ...p, trendingScore: undefined, salesVolumeEstimate: undefined })) : key === 'dropradar_suppliers_v2' ? items.map(s => ({ ...s, verifiedBadge: false, rating: undefined, reviewsCount: undefined })) : items;
  }
  return out;
}
