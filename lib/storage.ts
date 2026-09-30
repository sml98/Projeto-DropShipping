import { Product, Supplier, ChecklistStage } from '@/types';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIERS, INITIAL_CHECKLIST_STAGES } from './data/mockData';

const STORAGE_KEYS = {
  PRODUCTS: 'dropradar_products_v1',
  SUPPLIERS: 'dropradar_suppliers_v1',
  CHECKLIST: 'dropradar_checklist_v1',
  CALCULATOR_INPUT: 'dropradar_calc_state_v1',
};

// --- PRODUCTS ---
export function getStoredProducts(): Product[] {
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PRODUCTS;
  } catch (e) {
    console.warn('Erro ao carregar produtos do localStorage:', e);
    return INITIAL_PRODUCTS;
  }
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Erro ao salvar produtos no localStorage:', e);
  }
}

export function addStoredProduct(newProduct: Product): Product[] {
  const current = getStoredProducts();
  const updated = [newProduct, ...current];
  saveStoredProducts(updated);
  return updated;
}

// --- SUPPLIERS ---
export function getStoredSuppliers(): Supplier[] {
  if (typeof window === 'undefined') return INITIAL_SUPPLIERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
      return INITIAL_SUPPLIERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SUPPLIERS;
  } catch (e) {
    console.warn('Erro ao carregar fornecedores do localStorage:', e);
    return INITIAL_SUPPLIERS;
  }
}

export function saveStoredSuppliers(suppliers: Supplier[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  } catch (e) {
    console.error('Erro ao salvar fornecedores no localStorage:', e);
  }
}

export function addStoredSupplier(newSupplier: Supplier): Supplier[] {
  const current = getStoredSuppliers();
  const updated = [newSupplier, ...current];
  saveStoredSuppliers(updated);
  return updated;
}

// --- CHECKLIST ---
export function getStoredChecklist(): ChecklistStage[] {
  if (typeof window === 'undefined') return INITIAL_CHECKLIST_STAGES;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHECKLIST);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(INITIAL_CHECKLIST_STAGES));
      return INITIAL_CHECKLIST_STAGES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CHECKLIST_STAGES;
  } catch (e) {
    console.warn('Erro ao carregar checklist do localStorage:', e);
    return INITIAL_CHECKLIST_STAGES;
  }
}

export function saveStoredChecklist(stages: ChecklistStage[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(stages));
  } catch (e) {
    console.error('Erro ao salvar checklist no localStorage:', e);
  }
}

export function resetStoredChecklist(): ChecklistStage[] {
  if (typeof window === 'undefined') return INITIAL_CHECKLIST_STAGES;
  try {
    localStorage.setItem(STORAGE_KEYS.CHECKLIST, JSON.stringify(INITIAL_CHECKLIST_STAGES));
    return INITIAL_CHECKLIST_STAGES;
  } catch (e) {
    return INITIAL_CHECKLIST_STAGES;
  }
}
