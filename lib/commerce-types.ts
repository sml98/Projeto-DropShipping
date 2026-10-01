export type Origin = "national" | "international";
export type CandidateStatus =
  | "discovered"
  | "review"
  | "approved"
  | "published"
  | "rejected";
export type VerificationLevel =
  | "unverified"
  | "documented"
  | "sample-tested"
  | "audited";
export type MediaRights =
  | "unknown"
  | "supplier-authorized"
  | "licensed"
  | "owned";

export interface SupplierEvidence {
  label: string;
  url: string;
  checkedAt: string;
}

export interface CommerceSupplier {
  id: string;
  name: string;
  origin: Origin;
  country: string;
  integration: "api" | "feed" | "manual";
  verification: VerificationLevel;
  rating?: number;
  reviewsCount?: number;
  sampleOrderAt?: string;
  invoiceConfirmed: boolean;
  returnsConfirmed: boolean;
  trackingConfirmed: boolean;
  evidence: SupplierEvidence[];
}

export interface SupplierOffer {
  id: string;
  supplierId: string;
  sku: string;
  variant: string;
  unitCost: number;
  freight: number;
  importCharges: number;
  exchangeCharges: number;
  paymentFees: number;
  otherCosts: number;
  currency: "BRL";
  stock: number | null;
  minOrder: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  returnRiskPercent: number;
  sourceUrl: string;
  checkedAt: string;
  apiSynced: boolean;
  provider?: "cj" | "manual" | "other";
  providerProductId?: string;
  providerVariantId?: string;
  providerLogisticName?: string;
}

export interface DemandSignals {
  searchMomentum: number;
  socialMomentum: number;
  reviewQuality: number;
  reviewCount: number;
  evidenceCount: number;
  note: string;
}

export interface ProductMedia {
  id: string;
  kind: "image" | "video";
  url: string;
  previewUrl?: string;
  sourceUrl: string;
  rights: MediaRights;
  licenseNote: string;
  checkedAt: string;
}

export interface CommerceProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  summary: string;
  utility: string;
  tags: string[];
  imageUrl: string;
  imageSourceUrl: string;
  mediaRights: MediaRights;
  media?: ProductMedia[];
  targetPrice: number;
  estimatedCpa: number;
  taxPercent: number;
  demand: DemandSignals;
  offers: SupplierOffer[];
  status: CandidateStatus;
  selectedOfferId?: string;
  publishedAt?: string;
}

export interface OfferMetrics {
  landedCost: number;
  taxAmount: number;
  riskReserve: number;
  expectedProfit: number;
  marginPercent: number;
  breakEvenRoas: number | null;
}

export interface OpportunityAnalysis {
  productId: string;
  bestOfferId?: string;
  nationalOfferId?: string;
  internationalOfferId?: string;
  opportunityScore: number;
  economicsScore: number;
  demandScore: number;
  supplierScore: number;
  logisticsScore: number;
  creativeScore: number;
  blockers: string[];
  warnings: string[];
}

export interface CreativeDraft {
  id: string;
  productId: string;
  format: "feed" | "story" | "reel" | "tiktok";
  hook: string;
  caption: string;
  callToAction: string;
  status: "draft" | "approved" | "scheduled";
}

export interface CustomerAddress {
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  countryCode: "BR";
}

export interface CommerceOrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  offerId: string;
  supplierId: string;
  provider?: SupplierOffer["provider"];
  providerProductId?: string;
  providerVariantId?: string;
  providerLogisticName?: string;
}

export interface CommerceOrder {
  id: string;
  externalReference: string;
  paymentProvider: "mercado-pago";
  paymentId?: string;
  paymentStatus:
    | "created"
    | "pending"
    | "approved"
    | "rejected"
    | "refunded"
    | "cancelled";
  fulfillmentStatus:
    | "not-ready"
    | "ready"
    | "submitted"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "error";
  supplierOrderId?: string;
  trackingNumber?: string;
  trackingProvider?: string;
  trackingUrl?: string;
  total: number;
  currency: "BRL";
  customer: CustomerAddress;
  items: CommerceOrderItem[];
  createdAt: string;
  updatedAt: string;
  lastError?: string;
}

export interface IntegrationStatus {
  key: "tavily" | "gemini" | "cj" | "nuvemshop" | "mercado-pago" | "tiktok";
  name: string;
  configured: boolean;
  connected: boolean;
  detail: string;
  requiresUser: string[];
}
