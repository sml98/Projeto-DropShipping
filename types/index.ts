export type OriginType = 'nacional' | 'internacional';

export interface Product {
  id: string;
  name: string;
  category: string;
  niche: string;
  origin: OriginType;
  originBadge: string;
  deliveryTime: string;
  imageUrl: string;
  supplierCost: number;
  suggestedPrice: number;
  estimatedFreight: number;
  grossMargin: number; // percentage
  supplierName: string;
  supplierLocation: string;
  description: string;
  painPoints?: string[];
  trendingScore?: number;
  salesVolumeEstimate?: string;
  isCustom?: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  tradeName?: string;
  origin: OriginType;
  category: string;
  location: string; // e.g. "Brás - SP", "Franca - SP", "Shenzhen - China"
  dispatchTime: string; // e.g. "24h a 48h" ou "7 a 12 dias"
  rating: number; // 1 to 5
  reviewsCount?: number;
  minOrder: string; // "Sem pedido mínimo (Drop unitário)"
  whatsapp: string; // phone number for wa.me
  catalogUrl?: string;
  description: string;
  verifiedBadge?: boolean;
  isCustom?: boolean;
}

export interface CalculationInput {
  cost: number;
  freight: number;
  sellingPrice: number;
  cpa: number;
  isRemessaConforme: boolean;
  gatewayFeePercent: number;
  gatewayFeeFixed: number;
  taxPercent: number; // Simples Nacional / MEI
}

export interface CalculationResult {
  grossRevenue: number;
  remessaConformeImportTax: number; // 20%
  remessaConformeIcms: number; // 17%
  remessaConformeTotalTax: number;
  totalProductAndFreightCost: number;
  gatewayDeduction: number;
  taxDeduction: number;
  cpaCost: number;
  totalOperatingCost: number;
  netProfit: number;
  netMargin: number;
  breakEvenRoas: number;
  verdict: 'excelente' | 'moderado' | 'inviavel';
  verdictTitle: string;
  verdictDescription: string;
}

export interface OfferStructure {
  productName: string;
  title: string;
  painPoints: string[];
  adCopy: string;
  videoScript: {
    hook: string;
    problem: string;
    solution: string;
    callToAction: string;
  };
}

export interface ChecklistSubtask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  proTip?: string;
}

export interface ChecklistStage {
  id: number;
  title: string;
  subtitle: string;
  tasks: ChecklistSubtask[];
}
