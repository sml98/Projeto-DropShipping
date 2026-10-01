"use client";
/* eslint-disable @next/next/no-img-element -- images come from the selected CJ product */

import { useState } from "react";
import { Download, ExternalLink, Loader2, Play, Search } from "lucide-react";
import type { CommerceProduct, CommerceSupplier } from "@/lib/commerce-types";

type SearchRow = {
  providerProductId: string;
  name: string;
  sku: string;
  category: string;
  imageUrl: string;
  priceUsd: number;
  priceBrl: number | null;
  stock: number | null;
  listedCount: number;
  hasVideo: boolean;
  description: string;
  deliveryCycle: string;
};
type Detail = {
  providerProductId: string;
  name: string;
  sku: string;
  category: string;
  description: string;
  sourceUrl: string;
  usdBrl: number | null;
  rateDate: string | null;
  images: string[];
  videos: Array<{
    id: string;
    url: string;
    previewUrl: string;
    name: string;
    isFree: boolean;
    isPurchased: boolean;
    copyright: string;
  }>;
  variants: Array<{
    id: string;
    sku: string;
    name: string;
    imageUrl: string;
    priceUsd: number;
    priceBrl: number | null;
    weightGrams: number;
  }>;
};

const cjSupplier: CommerceSupplier = {
  id: "sup-cj",
  name: "CJdropshipping",
  origin: "international",
  country: "China / Global",
  integration: "api",
  verification: "documented",
  invoiceConfirmed: false,
  returnsConfirmed: false,
  trackingConfirmed: true,
  evidence: [
    {
      label: "Documentação oficial da API CJ",
      url: "https://developers.cjdropshipping.com/en/api/api2/",
      checkedAt: new Date().toISOString(),
    },
  ],
};

export function CJImportPanel({
  token,
  onImport,
}: {
  token: string;
  onImport: (
    product: CommerceProduct,
    supplier: CommerceSupplier,
  ) => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<SearchRow[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function request(url: string) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "A CJ não respondeu.");
    return data;
  }
  async function search() {
    if (query.trim().length < 2) return;
    setLoading(true);
    setError("");
    setDetail(null);
    try {
      const data = await request(
        `/api/connectors/cj/search?q=${encodeURIComponent(query.trim())}`,
      );
      setRows(data.products || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha na busca.");
    } finally {
      setLoading(false);
    }
  }
  async function inspect(id: string) {
    setLoading(true);
    setError("");
    try {
      setDetail(
        await request(
          `/api/connectors/cj/product?id=${encodeURIComponent(id)}`,
        ),
      );
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Falha nos detalhes.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function importProduct() {
    if (
      !detail ||
      !detail.variants[0] ||
      !detail.images[0] ||
      !detail.variants[0].priceBrl
    ) {
      setError(
        "A importação exige variante, imagem e cotação USD/BRL válidas.",
      );
      return;
    }
    const variant = detail.variants[0];
    const cost = Number(variant.priceBrl);
    const now = new Date().toISOString();
    const id = `cj-${detail.providerProductId}`;
    const media = [
      ...detail.images.map((url, index) => ({
        id: `${id}-image-${index}`,
        kind: "image" as const,
        url,
        sourceUrl: detail.sourceUrl,
        rights: "unknown" as const,
        licenseNote:
          "Imagem real recebida pela API CJ. Confirme no contrato/conta se a reutilização comercial é autorizada.",
        checkedAt: now,
      })),
      ...detail.videos.map((video, index) => ({
        id: `${id}-video-${index}`,
        kind: "video" as const,
        url: video.url,
        previewUrl: video.previewUrl || undefined,
        sourceUrl: detail.sourceUrl,
        rights: "unknown" as const,
        licenseNote: `Vídeo real recebido pela API CJ; isFree=${video.isFree}; isPurchased=${video.isPurchased}; copyright=${video.copyright || "não informado"}. Confirme o direito comercial antes de publicar.`,
        checkedAt: now,
      })),
    ];
    const targetPrice = Math.ceil((cost * 2.7) / 10) * 10 - 0.1;
    const product: CommerceProduct = {
      id,
      slug:
        detail.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "")
          .slice(0, 120) || id,
      name: detail.name,
      category: detail.category,
      summary:
        detail.description || "Produto real importado da CJdropshipping.",
      utility: detail.description || "Utilidade a revisar antes da publicação.",
      tags: [
        "CJdropshipping",
        "produto real",
        detail.videos.length ? "vídeo disponível" : "imagem real",
      ],
      imageUrl: detail.images[0],
      imageSourceUrl: detail.sourceUrl,
      mediaRights: "unknown",
      media,
      targetPrice,
      estimatedCpa: Math.round(targetPrice * 0.2 * 100) / 100,
      taxPercent: 6,
      demand: {
        searchMomentum: 0,
        socialMomentum: 0,
        reviewQuality: 0,
        reviewCount: 0,
        evidenceCount: 1,
        note: "Produto real da CJ; demanda e feedbacks ainda precisam de fontes independentes.",
      },
      status: "review",
      offers: [
        {
          id: `${id}-${variant.id}`,
          supplierId: cjSupplier.id,
          sku: variant.sku,
          variant: variant.name,
          unitCost: cost,
          freight: 0,
          importCharges: 0,
          exchangeCharges: Math.round(cost * 0.04 * 100) / 100,
          paymentFees: 0,
          otherCosts: 0,
          currency: "BRL",
          stock: null,
          minOrder: 1,
          deliveryMinDays: 0,
          deliveryMaxDays: 30,
          returnRiskPercent: 8,
          sourceUrl: detail.sourceUrl,
          checkedAt: now,
          apiSynced: true,
          provider: "cj",
          providerProductId: detail.providerProductId,
          providerVariantId: variant.id,
        },
      ],
    };
    setLoading(true);
    try {
      await onImport(product, cjSupplier);
      setError("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao importar.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 space-y-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-blue-300">
          Catálogo real CJ
        </p>
        <p className="text-xs text-slate-500 mt-1">
          Importa produto, variantes, imagens e vídeos exatos. A licença
          continua pendente até sua confirmação.
        </p>
      </div>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") search();
          }}
          placeholder="Ex.: kitchen organizer"
          className="min-w-0 flex-1 px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm"
        />
        <button
          onClick={search}
          disabled={loading || !token}
          className="px-4 rounded-xl bg-blue-500 text-white font-bold text-sm disabled:opacity-40"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-rose-300">{error}</p>}
      {!detail && rows.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {rows.map((row) => (
            <button
              key={row.providerProductId}
              onClick={() => inspect(row.providerProductId)}
              className="text-left rounded-xl border border-slate-800 bg-slate-950 overflow-hidden"
            >
              <img
                src={row.imageUrl}
                alt={row.name}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <p className="font-semibold text-sm line-clamp-2">{row.name}</p>
                <p className="text-xs text-emerald-300 mt-2">
                  {row.priceBrl
                    ? `R$ ${row.priceBrl.toFixed(2)}`
                    : `US$ ${row.priceUsd.toFixed(2)}`}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {row.stock ?? "Estoque não informado"} ·{" "}
                  {row.hasVideo ? "com vídeo" : "sem vídeo"}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {detail && (
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-4">
          <div>
            <img
              src={detail.images[0]}
              alt={detail.name}
              className="w-full aspect-square object-cover rounded-xl"
            />
            {detail.videos[0] && (
              <div className="mt-2 flex items-center gap-2 text-xs text-violet-300">
                <Play className="w-4 h-4" /> {detail.videos.length} vídeo(s)
                real(is) localizado(s)
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-lg">{detail.name}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {detail.variants.length} variantes · {detail.images.length}{" "}
              imagens · {detail.videos.length} vídeos
            </p>
            <p className="text-sm text-slate-400 mt-3 line-clamp-5">
              {detail.description || "Descrição não informada."}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button
                onClick={importProduct}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm inline-flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Importar para revisão
              </button>
              <a
                href={detail.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl border border-slate-700 text-sm inline-flex items-center gap-2"
              >
                Fonte <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 text-sm text-slate-400"
              >
                Voltar
              </button>
            </div>
            <p className="text-[11px] text-amber-300 mt-4">
              O preço importado não inclui frete e impostos. A publicação fica
              bloqueada até completar custos, evidências e direitos da mídia.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
