import "server-only";

import { getExchangeRates } from "@/lib/exchange-rates";

const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const cache = globalThis as typeof globalThis & {
  __cjToken?: { value: string; expiresAt: number };
};

type CjEnvelope<T> = {
  code?: number;
  result?: boolean;
  success?: boolean;
  message?: string;
  data?: T;
};

async function accessToken() {
  if (process.env.CJ_ACCESS_TOKEN) return process.env.CJ_ACCESS_TOKEN;
  if (cache.__cjToken && cache.__cjToken.expiresAt > Date.now() + 86400000)
    return cache.__cjToken.value;
  const apiKey = process.env.CJ_API_KEY;
  if (!apiKey) throw new Error("Configure CJ_API_KEY no servidor.");
  const response = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey }),
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const result = (await response.json()) as CjEnvelope<{
    accessToken?: string;
    accessTokenExpiryDate?: string;
  }>;
  if (!response.ok || !result.data?.accessToken)
    throw new Error(result.message || "A CJ recusou a API Key.");
  const expiresAt =
    Date.parse(result.data.accessTokenExpiryDate || "") ||
    Date.now() + 150 * 86400000;
  cache.__cjToken = { value: result.data.accessToken, expiresAt };
  return result.data.accessToken;
}

async function cjFetch<T>(pathname: string, init?: RequestInit) {
  const token = await accessToken();
  const response = await fetch(`${CJ_BASE}${pathname}`, {
    ...init,
    headers: {
      "CJ-Access-Token": token,
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
    cache: "no-store",
    signal: AbortSignal.timeout(25000),
  });
  const result = (await response.json()) as CjEnvelope<T>;
  if (
    !response.ok ||
    result.result === false ||
    result.success === false ||
    result.data == null
  )
    throw new Error(result.message || "A CJ não retornou dados válidos.");
  return result.data;
}

function safeUrl(value: unknown) {
  return typeof value === "string" && value.startsWith("https://") ? value : "";
}
function plainText(value: unknown) {
  return typeof value === "string"
    ? value
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    : "";
}

export async function searchCjProducts(query: string) {
  const params = new URLSearchParams({
    page: "1",
    size: "20",
    keyWord: query,
    features: "enable_description,enable_category,enable_video",
    orderBy: "0",
  });
  const data = await cjFetch<{
    content?: Array<{ productList?: Array<Record<string, unknown>> }>;
  }>(`/product/listV2?${params}`);
  const rateResult = await getExchangeRates(["USD"]).catch(() => ({
    rates: [],
    missing: ["USD"],
  }));
  const usdBrl =
    rateResult.rates.find((rate) => rate.currency === "USD")?.rate ||
    Number(process.env.USD_BRL_RATE || 0);
  const rows = (data.content || []).flatMap((group) => group.productList || []);
  return {
    usdBrl: usdBrl || null,
    rateDate: rateResult.rates[0]?.date || null,
    products: rows
      .map((row) => ({
        providerProductId: String(row.id || ""),
        name: String(row.nameEn || row.sku || "Produto CJ"),
        sku: String(row.sku || row.spu || ""),
        category: String(
          row.threeCategoryName ||
            row.twoCategoryName ||
            row.oneCategoryName ||
            "CJdropshipping",
        ),
        imageUrl: safeUrl(row.bigImage),
        priceUsd: Number(row.nowPrice || row.sellPrice || 0),
        priceBrl: usdBrl
          ? Math.round(
              Number(row.nowPrice || row.sellPrice || 0) * usdBrl * 100,
            ) / 100
          : null,
        stock: Number.isFinite(
          Number(row.totalVerifiedInventory ?? row.warehouseInventoryNum),
        )
          ? Number(row.totalVerifiedInventory ?? row.warehouseInventoryNum)
          : null,
        listedCount: Number(row.listedNum || 0),
        hasVideo:
          Number(row.isVideo || 0) === 1 ||
          (Array.isArray(row.videoList) && row.videoList.length > 0),
        description: plainText(row.description).slice(0, 1200),
        deliveryCycle: String(row.deliveryCycle || ""),
      }))
      .filter((row) => row.providerProductId && row.imageUrl),
  };
}

export async function getCjProduct(productId: string) {
  const params = new URLSearchParams({
    pid: productId,
    features: "enable_video",
  });
  const [detail, videos, rateResult] = await Promise.all([
    cjFetch<Record<string, unknown>>(`/product/query?${params}`),
    cjFetch<Array<Record<string, unknown>>>("/product/queryVideosByProductId", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }).catch(() => []),
    getExchangeRates(["USD"]).catch(() => ({ rates: [], missing: ["USD"] })),
  ]);
  const usdBrl =
    rateResult.rates.find((rate) => rate.currency === "USD")?.rate ||
    Number(process.env.USD_BRL_RATE || 0);
  const variants = Array.isArray(detail.variants)
    ? (detail.variants as Array<Record<string, unknown>>)
    : [];
  const images = [
    detail.bigImage,
    ...(Array.isArray(detail.productImageSet) ? detail.productImageSet : []),
    ...variants.map((v) => v.variantImage),
  ]
    .map(safeUrl)
    .filter(Boolean)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 20);
  return {
    providerProductId: String(detail.pid || productId),
    name: String(detail.productNameEn || detail.productSku || "Produto CJ"),
    sku: String(detail.productSku || ""),
    category: String(detail.categoryName || "CJdropshipping"),
    description: plainText(detail.description).slice(0, 2000),
    sourceUrl: `https://cjdropshipping.com/`,
    usdBrl: usdBrl || null,
    rateDate: rateResult.rates[0]?.date || null,
    images,
    videos: videos
      .flatMap((video) => {
        const videoUrl = safeUrl(video.videoUrl);
        if (!videoUrl) return [];
        return [
          {
            id: String(video.videoId || video.id || videoUrl),
            url: videoUrl,
            previewUrl: safeUrl(video.coverURL),
            name: String(video.videoName || "Vídeo do produto"),
            isFree: String(video.isFree || "") === "1",
            isPurchased: Boolean(video.isBuy),
            copyright: String(video.copyright || ""),
          },
        ];
      })
      .slice(0, 10),
    variants: variants
      .map((variant) => ({
        id: String(variant.vid || ""),
        sku: String(variant.variantSku || ""),
        name: String(
          variant.variantNameEn ||
            variant.variantKey ||
            variant.variantSku ||
            "Variante",
        ),
        imageUrl: safeUrl(variant.variantImage),
        priceUsd: Number(variant.variantSellPrice || detail.sellPrice || 0),
        priceBrl: usdBrl
          ? Math.round(
              Number(variant.variantSellPrice || detail.sellPrice || 0) *
                usdBrl *
                100,
            ) / 100
          : null,
        weightGrams: Number(variant.variantWeight || 0),
      }))
      .filter((variant) => variant.id),
  };
}

export async function calculateCjFreight(input: {
  variantId: string;
  quantity: number;
  destinationCountryCode?: string;
}) {
  return cjFetch<unknown>("/logistic/freightCalculate", {
    method: "POST",
    body: JSON.stringify({
      startCountryCode: "CN",
      endCountryCode: input.destinationCountryCode || "BR",
      products: [{ quantity: input.quantity, vid: input.variantId }],
    }),
  });
}

export async function createCjOrder(input: {
  orderNumber: string;
  customer: {
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
  };
  logisticName: string;
  products: Array<{ variantId: string; quantity: number; lineId: string }>;
}) {
  return cjFetch<{
    orderId?: string;
    orderNumber?: string;
    orderStatus?: string;
  }>("/shopping/order/createOrderV2", {
    method: "POST",
    body: JSON.stringify({
      orderNumber: input.orderNumber.slice(0, 50),
      shippingZip: input.customer.postalCode,
      shippingCountry: "Brazil",
      shippingCountryCode: "BR",
      shippingProvince: input.customer.state,
      shippingCity: input.customer.city,
      shippingCounty: input.customer.district,
      shippingPhone: input.customer.phone.slice(0, 20),
      shippingCustomerName: input.customer.name.slice(0, 50),
      shippingAddress: input.customer.street,
      shippingAddress2: input.customer.complement || "",
      houseNumber: input.customer.number.slice(0, 20),
      email: input.customer.email.slice(0, 50),
      remark: `DropRadar ${input.orderNumber}`,
      payType: 3,
      isSandbox: process.env.CJ_ENVIRONMENT === "production" ? 0 : 1,
      logisticName: input.logisticName.slice(0, 50),
      fromCountryCode: "CN",
      platform: "Api",
      orderFlow: 1,
      products: input.products.map((product) => ({
        vid: product.variantId,
        quantity: product.quantity,
        storeLineItemId: product.lineId.slice(0, 125),
      })),
    }),
  });
}

export async function getCjOrder(orderId: string) {
  const params = new URLSearchParams({
    orderId,
    features: "LOGISTICS_TIMELINESS",
  });
  return cjFetch<{
    orderId?: string;
    cjOrderId?: string;
    orderStatus?: string;
    subStatus?: string | null;
    trackNumber?: string | null;
    trackingProvider?: string | null;
    trackingUrl?: string | null;
  }>(`/shopping/order/getOrderDetail?${params}`);
}
