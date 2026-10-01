import type {
  CommerceProduct,
  CommerceSupplier,
  CreativeDraft,
  CustomerAddress,
} from "@/lib/commerce-types";

const text = (value: unknown, name: string, max = 500) => {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error(`${name} inválido.`);
  return value.trim();
};
const optionalText = (value: unknown, max = 500) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const number = (value: unknown, name: string, max = 10_000_000) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > max)
    throw new Error(`${name} inválido.`);
  return parsed;
};
const url = (value: unknown, name: string, allowLocal = false) => {
  const candidate = text(value, name, 2048);
  if (allowLocal && candidate.startsWith("/")) return candidate;
  const parsed = new URL(candidate);
  if (parsed.protocol !== "https:")
    throw new Error(`${name} precisa usar HTTPS.`);
  return candidate;
};

export function validateProduct(input: unknown): CommerceProduct {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Produto inválido.");
  const p = input as Record<string, unknown>;
  const statuses = [
    "discovered",
    "review",
    "approved",
    "published",
    "rejected",
  ];
  const rights = ["unknown", "supplier-authorized", "licensed", "owned"];
  if (
    !statuses.includes(String(p.status)) ||
    !rights.includes(String(p.mediaRights))
  )
    throw new Error("Status do produto inválido.");
  if (
    !Array.isArray(p.tags) ||
    p.tags.length > 20 ||
    !Array.isArray(p.offers) ||
    p.offers.length > 20
  )
    throw new Error("Tags ou ofertas inválidas.");
  const demand = p.demand as Record<string, unknown>;
  if (!demand || typeof demand !== "object")
    throw new Error("Sinais de demanda inválidos.");
  const offers = p.offers.map((raw, index) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw))
      throw new Error(`Oferta ${index + 1} inválida.`);
    const o = raw as Record<string, unknown>;
    return {
      id: text(o.id, "ID da oferta", 200),
      supplierId: text(o.supplierId, "Fornecedor", 200),
      sku: text(o.sku, "SKU", 200),
      variant: text(o.variant, "Variante", 200),
      unitCost: number(o.unitCost, "Custo"),
      freight: number(o.freight, "Frete"),
      importCharges: number(o.importCharges, "Importação"),
      exchangeCharges: number(o.exchangeCharges, "Câmbio"),
      paymentFees: number(o.paymentFees, "Taxas"),
      otherCosts: number(o.otherCosts, "Outros custos"),
      currency: "BRL" as const,
      stock: o.stock == null ? null : Math.floor(number(o.stock, "Estoque")),
      minOrder: Math.max(
        1,
        Math.floor(number(o.minOrder, "Pedido mínimo", 100000)),
      ),
      deliveryMinDays: Math.floor(
        number(o.deliveryMinDays, "Prazo mínimo", 365),
      ),
      deliveryMaxDays: Math.floor(
        number(o.deliveryMaxDays, "Prazo máximo", 365),
      ),
      returnRiskPercent: number(o.returnRiskPercent, "Risco de devolução", 100),
      sourceUrl: url(o.sourceUrl, "Fonte"),
      checkedAt: text(o.checkedAt, "Data de verificação", 100),
      apiSynced: Boolean(o.apiSynced),
      provider: ["cj", "manual", "other"].includes(String(o.provider))
        ? (o.provider as "cj" | "manual" | "other")
        : undefined,
      providerProductId: optionalText(o.providerProductId, 200) || undefined,
      providerVariantId: optionalText(o.providerVariantId, 200) || undefined,
      providerLogisticName:
        optionalText(o.providerLogisticName, 200) || undefined,
    };
  });
  const media = Array.isArray(p.media)
    ? p.media.slice(0, 30).map((raw, index) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw))
          throw new Error(`Mídia ${index + 1} inválida.`);
        const m = raw as Record<string, unknown>;
        if (
          !["image", "video"].includes(String(m.kind)) ||
          !rights.includes(String(m.rights))
        )
          throw new Error(`Mídia ${index + 1} inválida.`);
        return {
          id: text(m.id, "ID da mídia", 200),
          kind: m.kind as "image" | "video",
          url: url(m.url, "URL da mídia"),
          previewUrl: m.previewUrl
            ? url(m.previewUrl, "Prévia da mídia")
            : undefined,
          sourceUrl: url(m.sourceUrl, "Fonte da mídia"),
          rights: m.rights as CommerceProduct["mediaRights"],
          licenseNote: text(m.licenseNote, "Licença da mídia", 1000),
          checkedAt: text(m.checkedAt, "Data da mídia", 100),
        };
      })
    : undefined;
  if (offers.some((offer) => offer.deliveryMaxDays < offer.deliveryMinDays))
    throw new Error("Prazo máximo deve ser maior ou igual ao mínimo.");
  return {
    id: text(p.id, "ID", 200),
    slug: text(p.slug, "Slug", 200),
    name: text(p.name, "Nome", 200),
    category: text(p.category, "Categoria", 200),
    summary: text(p.summary, "Resumo", 4000),
    utility: text(p.utility, "Utilidade", 2000),
    tags: p.tags.map((tag) => text(tag, "Tag", 80)),
    imageUrl: url(p.imageUrl, "Imagem", true),
    imageSourceUrl: url(p.imageSourceUrl, "Fonte da imagem"),
    mediaRights: p.mediaRights as CommerceProduct["mediaRights"],
    media,
    targetPrice: number(p.targetPrice, "Preço"),
    estimatedCpa: number(p.estimatedCpa, "CPA"),
    taxPercent: number(p.taxPercent, "Imposto", 100),
    demand: {
      searchMomentum: number(demand.searchMomentum, "Demanda de busca", 100),
      socialMomentum: number(demand.socialMomentum, "Demanda social", 100),
      reviewQuality: number(demand.reviewQuality, "Avaliação", 5),
      reviewCount: Math.floor(number(demand.reviewCount, "Avaliações")),
      evidenceCount: Math.floor(
        number(demand.evidenceCount, "Evidências", 1000),
      ),
      note: optionalText(demand.note, 2000),
    },
    offers,
    status: p.status as CommerceProduct["status"],
    selectedOfferId: optionalText(p.selectedOfferId, 200) || undefined,
    publishedAt: optionalText(p.publishedAt, 100) || undefined,
  };
}

export function validateSupplier(input: unknown): CommerceSupplier {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Fornecedor inválido.");
  const s = input as Record<string, unknown>;
  if (
    !["national", "international"].includes(String(s.origin)) ||
    !["api", "feed", "manual"].includes(String(s.integration)) ||
    !["unverified", "documented", "sample-tested", "audited"].includes(
      String(s.verification),
    )
  )
    throw new Error("Classificação do fornecedor inválida.");
  if (!Array.isArray(s.evidence) || s.evidence.length > 30)
    throw new Error("Evidências inválidas.");
  return {
    id: text(s.id, "ID", 200),
    name: text(s.name, "Nome", 200),
    origin: s.origin as CommerceSupplier["origin"],
    country: text(s.country, "País", 100),
    integration: s.integration as CommerceSupplier["integration"],
    verification: s.verification as CommerceSupplier["verification"],
    rating: s.rating == null ? undefined : number(s.rating, "Nota", 5),
    reviewsCount:
      s.reviewsCount == null
        ? undefined
        : Math.floor(number(s.reviewsCount, "Avaliações")),
    sampleOrderAt: optionalText(s.sampleOrderAt, 100) || undefined,
    invoiceConfirmed: Boolean(s.invoiceConfirmed),
    returnsConfirmed: Boolean(s.returnsConfirmed),
    trackingConfirmed: Boolean(s.trackingConfirmed),
    evidence: s.evidence.map((raw) => {
      const e = raw as Record<string, unknown>;
      return {
        label: text(e.label, "Evidência", 300),
        url: url(e.url, "URL da evidência"),
        checkedAt: text(e.checkedAt, "Data da evidência", 100),
      };
    }),
  };
}

export function validateCreative(input: unknown): CreativeDraft {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Criativo inválido.");
  const c = input as Record<string, unknown>;
  if (
    !["feed", "story", "reel", "tiktok"].includes(String(c.format)) ||
    !["draft", "approved", "scheduled"].includes(String(c.status))
  )
    throw new Error("Formato ou status inválido.");
  return {
    id: text(c.id, "ID", 200),
    productId: text(c.productId, "Produto", 200),
    format: c.format as CreativeDraft["format"],
    hook: text(c.hook, "Gancho", 500),
    caption: text(c.caption, "Legenda", 4000),
    callToAction: text(c.callToAction, "CTA", 300),
    status: c.status as CreativeDraft["status"],
  };
}

export function validateCustomer(input: unknown): CustomerAddress {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Endereço obrigatório.");
  const c = input as Record<string, unknown>;
  const postalCode = text(c.postalCode, "CEP", 20).replace(/\D/g, "");
  if (postalCode.length !== 8) throw new Error("CEP inválido.");
  const email = text(c.email, "E-mail", 200).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("E-mail inválido.");
  return {
    name: text(c.name, "Nome", 200),
    email,
    phone: text(c.phone, "Telefone", 30),
    postalCode,
    street: text(c.street, "Rua", 250),
    number: text(c.number, "Número", 30),
    complement: optionalText(c.complement, 200) || undefined,
    district: text(c.district, "Bairro", 150),
    city: text(c.city, "Cidade", 150),
    state: text(c.state, "Estado", 2).toUpperCase(),
    countryCode: "BR",
  };
}
