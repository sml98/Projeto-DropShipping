"use client";
/* eslint-disable @next/next/no-img-element -- supplier media hosts are dynamic and recorded per product */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Database,
  ExternalLink,
  Film,
  Gauge,
  Globe2,
  LayoutDashboard,
  Link2,
  Loader2,
  PackageCheck,
  Search,
  Settings2,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import type {
  CandidateStatus,
  CommerceOrder,
  CommerceProduct,
  CommerceSupplier,
  CreativeDraft,
  IntegrationStatus,
} from "@/lib/commerce-types";
import {
  analyzeOpportunity,
  calculateOfferMetrics,
  selectBestOffer,
} from "@/lib/opportunity-engine";
import { ResearchPanel } from "@/components/ResearchPanel";
import { CJImportPanel } from "@/components/CJImportPanel";
import { AiOfferGenerator } from "@/components/AiOfferGenerator";
import { ProductEditor } from "@/components/ProductEditor";
import { SupplierEditor } from "@/components/SupplierEditor";
import { adminWrite, loadAdminState } from "@/lib/admin-client";
import type { Product as LegacyProduct } from "@/types";

type Tab =
  | "overview"
  | "discovery"
  | "compare"
  | "selection"
  | "catalog"
  | "creative"
  | "suppliers"
  | "orders"
  | "settings";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
const date = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
});
const displayDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.split("-").reverse().join("/")
    : date.format(new Date(value));
const statusLabel: Record<CandidateStatus, string> = {
  discovered: "Descoberto",
  review: "Em análise",
  approved: "Aprovado",
  published: "Publicado",
  rejected: "Rejeitado",
};
const statusClass: Record<CandidateStatus, string> = {
  discovered: "border-slate-700 bg-slate-800/70 text-slate-300",
  review: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  approved: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  published: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "discovery", label: "Descoberta", icon: Search },
  { id: "compare", label: "Comparador", icon: BarChart3 },
  { id: "selection", label: "Selecionados", icon: PackageCheck },
  { id: "catalog", label: "Catálogo", icon: Store },
  { id: "creative", label: "Criativos", icon: WandSparkles },
  { id: "suppliers", label: "Fornecedores", icon: Truck },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "settings", label: "Integrações", icon: Settings2 },
];

function ScoreRing({
  value,
  size = "md",
}: {
  value: number;
  size?: "sm" | "md";
}) {
  const color =
    value >= 70
      ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
      : value >= 50
        ? "text-amber-300 border-amber-500/30 bg-amber-500/10"
        : "text-rose-300 border-rose-500/30 bg-rose-500/10";
  return (
    <div
      className={`${size === "sm" ? "w-11 h-11 text-sm" : "w-16 h-16 text-xl"} rounded-full border-4 ${color} grid place-items-center font-black`}
    >
      {value}
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  icon: Icon,
  tone = "emerald",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Activity;
  tone?: "emerald" | "blue" | "amber" | "violet";
}) {
  const tones = {
    emerald: "text-emerald-300 bg-emerald-500/10",
    blue: "text-blue-300 bg-blue-500/10",
    amber: "text-amber-300 bg-amber-500/10",
    violet: "text-violet-300 bg-violet-500/10",
  };
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="text-2xl font-black mt-2 text-white">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${tones[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-3">{detail}</p>
    </div>
  );
}

export function DropshipCommandCenter() {
  const [tab, setTab] = useState<Tab>("overview");
  const [products, setProducts] = useState<CommerceProduct[]>([]);
  const [creatives, setCreatives] = useState<CreativeDraft[]>([]);
  const [suppliers, setSuppliers] = useState<CommerceSupplier[]>([]);
  const [orders, setOrders] = useState<CommerceOrder[]>([]);
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [selectedId, setSelectedId] = useState("prod-bottle");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [publishing, setPublishing] = useState<string | null>(null);
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CommerceProduct | null>(
    null,
  );

  const refreshFromServer = useCallback(async (token: string) => {
    if (!token) return;
    try {
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await loadAdminState(token);
      setProducts(data.products);
      setSuppliers(data.suppliers);
      setCreatives(data.creatives);
      setOrders(data.orders);
      setIntegrations(data.integrations);
      setNotice("Dados sincronizados com o servidor.");
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Falha ao sincronizar.",
      );
    }
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("dropradar_access") || "";
    setAccessToken(token);
    setHydrated(true);
    if (token) refreshFromServer(token);
  }, [refreshFromServer]);

  const analyses = useMemo(
    () =>
      new Map(
        products.map((product) => [
          product.id,
          analyzeOpportunity(product, suppliers),
        ]),
      ),
    [products, suppliers],
  );
  const selected =
    products.find((product) => product.id === selectedId) || products[0];
  const filtered = products.filter((product) =>
    `${product.name} ${product.category} ${product.tags.join(" ")}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const approved = products.filter((product) =>
    ["approved", "published"].includes(product.status),
  );
  const averageScore = products.length
    ? Math.round(
        products.reduce(
          (sum, product) =>
            sum + (analyses.get(product.id)?.opportunityScore || 0),
          0,
        ) / products.length,
      )
    : 0;
  const expectedRevenue = approved.reduce(
    (sum, product) => sum + product.targetPrice,
    0,
  );

  function updateProduct(id: string, patch: Partial<CommerceProduct>) {
    setProducts((current) => {
      const next = current.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      );
      const changed = next.find((product) => product.id === id);
      if (changed && accessToken)
        adminWrite(accessToken, {
          action: "upsertProduct",
          value: changed,
        }).catch((error) => setNotice(error.message));
      return next;
    });
  }

  function approveProduct(product: CommerceProduct) {
    const analysis = analyses.get(product.id);
    if (analysis?.blockers.length) {
      setNotice(`Não aprovado: ${analysis.blockers.join(" ")}`);
      return;
    }
    updateProduct(product.id, {
      status: "approved",
      selectedOfferId: analysis?.bestOfferId,
    });
    setNotice(`${product.name} entrou na seleção.`);
  }

  function publishLocally(product: CommerceProduct) {
    const analysis = analyses.get(product.id);
    if (analysis?.blockers.length) {
      setNotice(`Publicação bloqueada: ${analysis.blockers.join(" ")}`);
      return;
    }
    updateProduct(product.id, {
      status: "published",
      publishedAt: new Date().toISOString(),
      selectedOfferId: product.selectedOfferId || analysis?.bestOfferId,
    });
    setNotice(`${product.name} publicado na vitrine local.`);
  }

  async function publishNuvemshop(product: CommerceProduct) {
    setPublishing(product.id);
    setNotice("");
    try {
      const response = await fetch("/api/publish/nuvemshop", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ product }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Falha ao publicar.");
      updateProduct(product.id, {
        status: "published",
        publishedAt: new Date().toISOString(),
      });
      setNotice(`Publicado na Nuvemshop: produto ${data.productId}.`);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Integração indisponível.",
      );
    } finally {
      setPublishing(null);
    }
  }

  function updateCreative(id: string, status: CreativeDraft["status"]) {
    setCreatives((current) => {
      const next = current.map((item) =>
        item.id === id ? { ...item, status } : item,
      );
      const changed = next.find((item) => item.id === id);
      if (changed && accessToken)
        adminWrite(accessToken, {
          action: "upsertCreative",
          value: changed,
        }).catch((error) => setNotice(error.message));
      return next;
    });
  }

  async function saveGeneratedCreative(draft: {
    hook: string;
    caption: string;
    callToAction: string;
  }) {
    if (!selected) throw new Error("Selecione um produto.");
    if (!accessToken) throw new Error("Conecte o painel primeiro.");
    const creative: CreativeDraft = {
      id: `creative-${crypto.randomUUID()}`,
      productId: selected.id,
      format: "tiktok",
      hook: draft.hook,
      caption: draft.caption,
      callToAction: draft.callToAction,
      status: "draft",
    };
    await adminWrite(accessToken, {
      action: "upsertCreative",
      value: creative,
    });
    setCreatives((current) => [creative, ...current]);
    setNotice("Criativo salvo como rascunho para revisão humana.");
  }

  function importResearchProduct(draft: Partial<LegacyProduct>) {
    const id = `research-${Date.now()}`;
    const name = draft.name?.trim() || "Produto pesquisado";
    const sourceUrl = draft.sourceUrl || draft.costSourceUrl;
    if (!sourceUrl?.startsWith("https://")) {
      setNotice("Importação recusada: a pesquisa não trouxe uma fonte HTTPS.");
      return;
    }
    const candidate: CommerceProduct = {
      id,
      slug:
        name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "") || id,
      name,
      category: draft.category || "Pesquisa web",
      summary:
        draft.description ||
        "Candidato importado da pesquisa web; revise todas as evidências.",
      utility: draft.description || "Utilidade ainda precisa ser confirmada.",
      tags: ["pesquisa web", "revisão obrigatória"],
      imageUrl: draft.imageUrl || "/product-placeholder.svg",
      imageSourceUrl: sourceUrl,
      mediaRights: "unknown",
      targetPrice: Math.max(0, draft.suggestedPrice || 0),
      estimatedCpa: 0,
      taxPercent: 0,
      demand: {
        searchMomentum: 0,
        socialMomentum: 0,
        reviewQuality: 0,
        reviewCount: 0,
        evidenceCount: 1,
        note: "Fonte encontrada; demanda ainda não validada.",
      },
      status: "review",
      offers: [
        {
          id: `${id}-offer`,
          supplierId: "sup-br-manual",
          sku: "CONFIRMAR",
          variant: "Confirmar variante",
          unitCost: Math.max(0, draft.supplierCost || 0),
          freight: Math.max(0, draft.estimatedFreight || 0),
          importCharges: 0,
          exchangeCharges: 0,
          paymentFees: 0,
          otherCosts: 0,
          currency: "BRL",
          stock: null,
          minOrder: 1,
          deliveryMinDays: 0,
          deliveryMaxDays: 30,
          returnRiskPercent: 8,
          sourceUrl,
          checkedAt: new Date().toISOString(),
          apiSynced: false,
        },
      ],
    };
    setProducts((current) => [candidate, ...current]);
    if (accessToken)
      adminWrite(accessToken, {
        action: "upsertProduct",
        value: candidate,
      }).catch((error) => setNotice(error.message));
    setSelectedId(id);
    setNotice(
      `${name} importado para revisão. Complete mídia, custos, fornecedor, estoque e demanda antes de aprovar.`,
    );
  }

  async function importCjProduct(
    product: CommerceProduct,
    supplier: CommerceSupplier,
  ) {
    if (!accessToken)
      throw new Error("Informe o token pessoal em Integrações.");
    await adminWrite(accessToken, {
      action: "upsertSupplier",
      value: supplier,
    });
    await adminWrite(accessToken, { action: "upsertProduct", value: product });
    setSuppliers((current) =>
      current.some((item) => item.id === supplier.id)
        ? current.map((item) => (item.id === supplier.id ? supplier : item))
        : [supplier, ...current],
    );
    setProducts((current) =>
      current.some((item) => item.id === product.id)
        ? current.map((item) => (item.id === product.id ? product : item))
        : [product, ...current],
    );
    setSelectedId(product.id);
    setNotice(
      `${product.name} importado com mídia real. Complete frete, demanda e licença antes de publicar.`,
    );
  }

  async function connectNuvemshop() {
    try {
      const response = await fetch("/api/oauth/nuvemshop/start", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "Não foi possível iniciar a autorização.",
        );
      location.href = data.url;
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Falha na autorização.",
      );
    }
  }

  async function connectTikTok() {
    try {
      const response = await fetch("/api/oauth/tiktok/start", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Não foi possível iniciar o TikTok.");
      location.href = data.url;
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Falha na autorização.",
      );
    }
  }

  async function loadDemoOnServer() {
    try {
      await adminWrite(accessToken, { action: "loadDemo" });
      await refreshFromServer(accessToken);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Falha ao carregar demonstração.",
      );
    }
  }

  async function submitCjOrder(order: CommerceOrder) {
    setFulfilling(order.id);
    setNotice("");
    try {
      const response = await fetch("/api/orders/cj", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Falha ao enviar o pedido à CJ.");
      setNotice(
        `Pedido ${data.supplierOrderId} criado na CJ${data.sandbox ? " em sandbox" : ""}. O pagamento na CJ continua manual.`,
      );
      await refreshFromServer(accessToken);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Falha no fulfillment.",
      );
    } finally {
      setFulfilling(null);
    }
  }

  async function syncCjOrder(order: CommerceOrder) {
    setFulfilling(order.id);
    setNotice("");
    try {
      const response = await fetch("/api/orders/cj", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ orderId: order.id }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Falha ao sincronizar o pedido CJ.");
      setNotice(
        `Pedido CJ sincronizado: ${data.subStatus || data.status}${data.trackingNumber ? ` · rastreio ${data.trackingNumber}` : ""}.`,
      );
      await refreshFromServer(accessToken);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Falha na sincronização.",
      );
    } finally {
      setFulfilling(null);
    }
  }

  async function saveEditedProduct(product: CommerceProduct) {
    if (!accessToken) throw new Error("Conecte o painel primeiro.");
    await adminWrite(accessToken, { action: "upsertProduct", value: product });
    setProducts((current) =>
      current.map((item) => (item.id === product.id ? product : item)),
    );
    setNotice(`${product.name} revisado e salvo no servidor.`);
  }

  async function saveSupplier(supplier: CommerceSupplier) {
    if (!accessToken) throw new Error("Conecte o painel primeiro.");
    await adminWrite(accessToken, {
      action: "upsertSupplier",
      value: supplier,
    });
    setSuppliers((current) => [supplier, ...current]);
    setNotice(`${supplier.name} cadastrado como não verificado.`);
  }

  if (!hydrated)
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050914] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/90 bg-[#050914]/95 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => setTab("overview")}
            className="flex items-center gap-3 shrink-0"
          >
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5" />
            </span>
            <span className="text-left hidden sm:block">
              <strong className="block leading-tight">DropRadar OS</strong>
              <small className="text-[10px] tracking-[.18em] text-emerald-400">
                COMMERCE INTELLIGENCE
              </small>
            </span>
          </button>
          <div className="hidden md:flex items-center gap-2 ml-4 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
            <Database className="w-3.5 h-3.5" /> Persistência no servidor ·
            publicação bloqueada sem evidências
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/loja"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 text-sm hover:bg-slate-800"
            >
              <ExternalLink className="w-4 h-4" />{" "}
              <span className="hidden sm:inline">Abrir vitrine</span>
            </Link>
            <button
              onClick={() => setTab("discovery")}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold hover:bg-emerald-400"
            >
              <Sparkles className="w-4 h-4" /> Prospectar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] border-r border-slate-800/80 p-3 overflow-x-auto lg:overflow-y-auto">
          <nav className="flex lg:flex-col gap-1 min-w-max lg:min-w-0">
            {nav.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left transition ${tab === item.id ? "bg-emerald-500/12 text-emerald-300 border border-emerald-500/20" : "text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent"}`}
                >
                  <Icon className="w-4 h-4" /> {item.label}
                  {item.id === "selection" && (
                    <span className="ml-auto text-[10px] bg-slate-800 rounded-full px-2 py-0.5">
                      {approved.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
          <div className="hidden lg:block mt-6 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <p className="text-xs text-slate-500">Saúde da operação</p>
            <div className="flex items-center gap-2 mt-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <strong className="text-sm">Operação protegida</strong>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Checkout revalida catálogo, custo e estoque.
            </p>
          </div>
        </aside>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8 pb-24">
          {notice && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 text-sm text-blue-100">
              <Activity className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {tab === "overview" && (
            <div className="space-y-7">
              <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 p-6 sm:p-8 overflow-hidden relative">
                <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative max-w-3xl">
                  <span className="text-xs uppercase tracking-[.22em] text-emerald-400 font-bold">
                    Central de decisão
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-3">
                    Da oportunidade ao pedido, com evidências.
                  </h1>
                  <p className="text-slate-400 mt-4 max-w-2xl">
                    Compare fornecedores nacionais e internacionais, aprove
                    produtos, publique na vitrine e transforme desempenho real
                    em decisões melhores.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <button
                      onClick={() => setTab("discovery")}
                      className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold inline-flex items-center gap-2"
                    >
                      <Search className="w-4 h-4" /> Ver oportunidades
                    </button>
                    <button
                      onClick={() => setTab("compare")}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 font-semibold inline-flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" /> Comparar cenários
                    </button>
                  </div>
                </div>
              </section>
              <section className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Metric
                  label="Oportunidades"
                  value={String(products.length)}
                  detail="Produtos em todas as etapas"
                  icon={Boxes}
                />
                <Metric
                  label="Score médio"
                  value={`${averageScore}/100`}
                  detail="Economia, demanda, risco e logística"
                  icon={Gauge}
                  tone="blue"
                />
                <Metric
                  label="Selecionados"
                  value={String(approved.length)}
                  detail="Aprovados ou publicados"
                  icon={PackageCheck}
                  tone="violet"
                />
                <Metric
                  label="Receita potencial"
                  value={money.format(expectedRevenue)}
                  detail="Uma unidade de cada selecionado"
                  icon={CircleDollarSign}
                  tone="amber"
                />
              </section>
              <section className="grid xl:grid-cols-[1.4fr_.8fr] gap-5">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-lg">
                        Melhores oportunidades
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Ordenadas pelo score composto
                      </p>
                    </div>
                    <button
                      onClick={() => setTab("discovery")}
                      className="text-xs text-emerald-300"
                    >
                      Ver todas
                    </button>
                  </div>
                  <div className="mt-4 space-y-2">
                    {[...products]
                      .sort(
                        (a, b) =>
                          (analyses.get(b.id)?.opportunityScore || 0) -
                          (analyses.get(a.id)?.opportunityScore || 0),
                      )
                      .slice(0, 4)
                      .map((product) => (
                        <button
                          key={product.id}
                          onClick={() => {
                            setSelectedId(product.id);
                            setTab("compare");
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/70 text-left"
                        >
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover bg-slate-800"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.category} · {statusLabel[product.status]}
                            </p>
                          </div>
                          <ScoreRing
                            value={
                              analyses.get(product.id)?.opportunityScore || 0
                            }
                            size="sm"
                          />
                          <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                      ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
                  <h2 className="font-bold text-lg">Funil de curadoria</h2>
                  <div className="space-y-4 mt-5">
                    {(
                      [
                        "discovered",
                        "review",
                        "approved",
                        "published",
                      ] as CandidateStatus[]
                    ).map((status, index) => {
                      const count = products.filter(
                        (p) => p.status === status,
                      ).length;
                      return (
                        <div key={status}>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">
                              {index + 1}. {statusLabel[status]}
                            </span>
                            <strong>{count}</strong>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                              style={{
                                width: `${products.length ? Math.max(5, (count / products.length) * 100) : 0}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>
          )}

          {tab === "discovery" && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[.2em] text-emerald-400 uppercase font-bold">
                    Prospecção
                  </p>
                  <h1 className="text-3xl font-black mt-1">
                    Oportunidades encontradas
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Produtos reais mantêm fonte, data, custos e licença da
                    mídia.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar produto, categoria ou tag"
                    className="w-full sm:w-80 pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm"
                  />
                </div>
              </div>
              <CJImportPanel token={accessToken} onImport={importCjProduct} />
              <details className="rounded-2xl border border-slate-800 bg-slate-900/50">
                <summary className="cursor-pointer list-none p-4 flex items-center gap-3 font-semibold text-emerald-300">
                  <Search className="w-4 h-4" /> Pesquisar tendências e fontes
                  públicas <ChevronRight className="w-4 h-4 ml-auto" />
                </summary>
                <div className="px-4 pb-4">
                  <ResearchPanel
                    onPrepareProduct={importResearchProduct}
                    onPrepareSupplier={(draft) =>
                      setNotice(
                        `Fonte de fornecedor encontrada: ${draft.name || "sem nome"}. Revise identidade, contrato, logística e evidências antes de cadastrar.`,
                      )
                    }
                  />
                </div>
              </details>
              <div className="grid md:grid-cols-2 2xl:grid-cols-3 gap-5">
                {filtered.map((product) => {
                  const analysis = analyses.get(product.id)!;
                  const best = selectBestOffer(product, suppliers);
                  return (
                    <article
                      key={product.id}
                      className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 group"
                    >
                      <div className="relative aspect-[16/9] bg-slate-800">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                        <div className="absolute left-3 top-3">
                          <span
                            className={`text-[11px] px-2 py-1 rounded-full border ${statusClass[product.status]}`}
                          >
                            {statusLabel[product.status]}
                          </span>
                        </div>
                        <div className="absolute right-3 top-3">
                          <ScoreRing
                            value={analysis.opportunityScore}
                            size="sm"
                          />
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-xs text-emerald-400">
                          {product.category}
                        </p>
                        <h2 className="font-bold text-lg mt-1">
                          {product.name}
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                          {product.utility}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2">
                          {product.media?.filter(
                            (item) => item.kind === "image",
                          ).length || 1}{" "}
                          foto(s) ·{" "}
                          {product.media?.filter(
                            (item) => item.kind === "video",
                          ).length || 0}{" "}
                          vídeo(s) · direitos {product.mediaRights}
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                          <div>
                            <span className="text-slate-600 block">Venda</span>
                            <strong>{money.format(product.targetPrice)}</strong>
                          </div>
                          <div>
                            <span className="text-slate-600 block">
                              Custo posto
                            </span>
                            <strong>
                              {best
                                ? money.format(
                                    calculateOfferMetrics(product, best)
                                      .landedCost,
                                  )
                                : "—"}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-600 block">
                              Lucro esperado
                            </span>
                            <strong className="text-emerald-300">
                              {best
                                ? money.format(
                                    calculateOfferMetrics(product, best)
                                      .expectedProfit,
                                  )
                                : "—"}
                            </strong>
                          </div>
                        </div>
                        {analysis.blockers.length > 0 && (
                          <p className="text-xs text-rose-300 mt-4">
                            {analysis.blockers[0]}
                          </p>
                        )}
                        <div className="grid grid-cols-3 gap-2 mt-5">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="py-2 rounded-xl border border-slate-700 text-sm font-semibold hover:bg-slate-800"
                          >
                            Revisar
                          </button>
                          <button
                            onClick={() => {
                              setSelectedId(product.id);
                              setTab("compare");
                            }}
                            className="py-2 rounded-xl border border-slate-700 text-sm font-semibold hover:bg-slate-800"
                          >
                            Comparar
                          </button>
                          <button
                            onClick={() => approveProduct(product)}
                            disabled={
                              analysis.blockers.length > 0 ||
                              ["approved", "published"].includes(product.status)
                            }
                            className="py-2 rounded-xl bg-emerald-500 text-slate-950 text-sm font-bold disabled:opacity-35"
                          >
                            Selecionar
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "compare" && selected && (
            <ComparePanel
              product={selected}
              suppliers={suppliers}
              analyses={analyses}
              onSelectProduct={setSelectedId}
              products={products}
              onChooseOffer={(offerId) =>
                updateProduct(selected.id, {
                  selectedOfferId: offerId,
                  status: "review",
                })
              }
              onApprove={() => approveProduct(selected)}
            />
          )}

          {tab === "selection" && (
            <div className="space-y-5">
              <div>
                <p className="text-xs tracking-[.2em] text-blue-400 uppercase font-bold">
                  Curadoria
                </p>
                <h1 className="text-3xl font-black mt-1">
                  Produtos selecionados
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Aprovação interna antes de qualquer publicação ao cliente.
                </p>
              </div>
              {approved.length === 0 ? (
                <Empty
                  title="Nenhum produto aprovado"
                  text="Compare oportunidades e aprove somente opções sem bloqueios."
                />
              ) : (
                <div className="grid xl:grid-cols-2 gap-4">
                  {approved.map((product) => {
                    const offer = selectBestOffer(product, suppliers);
                    const metrics = offer
                      ? calculateOfferMetrics(product, offer)
                      : null;
                    return (
                      <article
                        key={product.id}
                        className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex gap-4"
                      >
                        <img
                          src={product.imageUrl}
                          alt=""
                          className="w-24 h-24 rounded-xl object-cover bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className={`text-[10px] px-2 py-1 rounded-full border ${statusClass[product.status]}`}
                              >
                                {statusLabel[product.status]}
                              </span>
                              <h2 className="font-bold mt-2">{product.name}</h2>
                            </div>
                            <ScoreRing
                              value={
                                analyses.get(product.id)?.opportunityScore || 0
                              }
                              size="sm"
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {offer
                              ? `${suppliers.find((s) => s.id === offer.supplierId)?.name || "Fornecedor"} · ${metrics?.marginPercent}% margem`
                              : "Sem oferta"}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            <button
                              onClick={() => publishLocally(product)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
                            >
                              Publicar na vitrine
                            </button>
                            <button
                              onClick={() => publishNuvemshop(product)}
                              disabled={publishing === product.id}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs"
                            >
                              {publishing === product.id
                                ? "Publicando…"
                                : "Enviar à Nuvemshop"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "catalog" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <p className="text-xs tracking-[.2em] text-emerald-400 uppercase font-bold">
                    Vitrine
                  </p>
                  <h1 className="text-3xl font-black mt-1">
                    Catálogo publicado
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">
                    Somente produtos aprovados e explicitamente publicados.
                  </p>
                </div>
                <Link
                  href="/loja"
                  target="_blank"
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold inline-flex items-center justify-center gap-2"
                >
                  <Store className="w-4 h-4" /> Abrir loja
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {products
                  .filter((p) => p.status === "published")
                  .map((product) => (
                    <article
                      key={product.id}
                      className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="aspect-[4/3] w-full object-cover"
                      />
                      <div className="p-4">
                        <p className="text-xs text-emerald-400">
                          {product.category}
                        </p>
                        <h2 className="font-bold mt-1">{product.name}</h2>
                        <p className="text-2xl font-black mt-3">
                          {money.format(product.targetPrice)}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Publicado em{" "}
                          {product.publishedAt
                            ? displayDate(product.publishedAt)
                            : "agora"}
                        </p>
                        <button
                          onClick={() =>
                            updateProduct(product.id, {
                              status: "approved",
                              publishedAt: undefined,
                            })
                          }
                          className="text-xs text-rose-300 mt-4"
                        >
                          Retirar da vitrine
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          )}

          {tab === "creative" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[.2em] text-violet-400 uppercase font-bold">
                  Estúdio
                </p>
                <h1 className="text-3xl font-black mt-1">
                  Criativos orgânicos e persuasivos
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Gancho, demonstração, prova, objeção e CTA — apenas com fatos
                  confirmados e mídia autorizada.
                </p>
              </div>
              {selected && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                  <label className="text-xs text-slate-400">
                    Produto para geração
                    <select
                      value={selected.id}
                      onChange={(event) => setSelectedId(event.target.value)}
                      className="block mt-2 w-full max-w-lg bg-slate-950 border border-slate-700 rounded-xl px-3 py-2"
                    >
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
                    {(selected.media || []).map((media) => (
                      <div
                        key={media.id}
                        className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950"
                      >
                        {media.kind === "image" ? (
                          <img
                            src={media.url}
                            alt={selected.name}
                            className="aspect-video w-full object-cover"
                          />
                        ) : (
                          <video
                            controls
                            preload="metadata"
                            poster={media.previewUrl}
                            className="aspect-video w-full object-cover"
                            src={`/api/media/cj?url=${encodeURIComponent(media.url)}`}
                          />
                        )}
                        <div className="p-2">
                          <p
                            className={`text-[10px] ${media.rights === "unknown" ? "text-amber-300" : "text-emerald-300"}`}
                          >
                            {media.kind === "image"
                              ? "Foto real"
                              : "Vídeo real"}{" "}
                            · {media.rights}
                          </p>
                          <p className="text-[10px] text-slate-600 line-clamp-2 mt-1">
                            {media.licenseNote}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <AiOfferGenerator
                key={selected?.id || "none"}
                initialProductName={selected?.name || ""}
                onSave={saveGeneratedCreative}
              />
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                {creatives.map((item) => {
                  const product = products.find((p) => p.id === item.productId);
                  return (
                    <article
                      key={item.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden"
                    >
                      <div className="aspect-video relative bg-slate-800">
                        <img
                          src={product?.imageUrl}
                          alt=""
                          className="w-full h-full object-cover opacity-70"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                        <span className="absolute top-3 left-3 text-[10px] uppercase tracking-wider px-2 py-1 bg-black/60 rounded-full">
                          {item.format}
                        </span>
                        <p className="absolute bottom-3 left-3 right-3 font-black text-lg leading-tight">
                          {item.hook}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-slate-500">
                          {product?.name}
                        </p>
                        <p className="text-sm text-slate-300 mt-2">
                          {item.caption}
                        </p>
                        <div className="flex items-center gap-2 mt-4">
                          <span
                            className={`text-[10px] px-2 py-1 rounded-full border ${item.status === "approved" ? "text-emerald-300 border-emerald-500/30" : item.status === "scheduled" ? "text-blue-300 border-blue-500/30" : "text-amber-300 border-amber-500/30"}`}
                          >
                            {item.status === "draft"
                              ? "Rascunho"
                              : item.status === "approved"
                                ? "Aprovado"
                                : "Agendado"}
                          </span>
                          <button
                            onClick={() =>
                              updateCreative(
                                item.id,
                                item.status === "draft"
                                  ? "approved"
                                  : "scheduled",
                              )
                            }
                            className="ml-auto text-xs text-violet-300"
                          >
                            {item.status === "draft"
                              ? "Aprovar"
                              : item.status === "approved"
                                ? "Agendar"
                                : "Reagendar"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {tab === "suppliers" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[.2em] text-blue-400 uppercase font-bold">
                  Risco operacional
                </p>
                <h1 className="text-3xl font-black mt-1">
                  Fornecedores e evidências
                </h1>
                <p className="text-sm text-slate-500 mt-2">
                  Integração não equivale a auditoria. Cada afirmação deve
                  apontar para uma evidência.
                </p>
              </div>
              <SupplierEditor onSave={saveSupplier} />
              {suppliers.length === 0 ? (
                <Empty
                  title="Nenhum fornecedor real cadastrado"
                  text="Conecte a CJ ou cadastre uma fonte documentada."
                />
              ) : (
                <div className="grid lg:grid-cols-2 gap-4">
                  {suppliers.map((supplier) => (
                    <article
                      key={supplier.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Globe2
                              className={
                                supplier.origin === "national"
                                  ? "w-4 h-4 text-emerald-400"
                                  : "w-4 h-4 text-blue-400"
                              }
                            />
                            <h2 className="font-bold">{supplier.name}</h2>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {supplier.country} ·{" "}
                            {supplier.integration.toUpperCase()}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full border ${supplier.verification === "sample-tested" ? "text-emerald-300 border-emerald-500/30" : "text-amber-300 border-amber-500/30"}`}
                        >
                          {supplier.verification}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-5 text-center text-xs">
                        {[
                          ["NF", supplier.invoiceConfirmed],
                          ["Rastreio", supplier.trackingConfirmed],
                          ["Devolução", supplier.returnsConfirmed],
                        ].map(([label, ok]) => (
                          <div
                            key={String(label)}
                            className="rounded-lg bg-slate-950 p-2"
                          >
                            <span
                              className={
                                ok ? "text-emerald-300" : "text-rose-300"
                              }
                            >
                              {ok ? "Confirmado" : "Pendente"}
                            </span>
                            <small className="block text-slate-600 mt-1">
                              {String(label)}
                            </small>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 space-y-2">
                        {supplier.evidence.map((item) => (
                          <a
                            key={item.url}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-blue-300 hover:underline"
                          >
                            <Link2 className="w-3 h-3" />
                            {item.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                      <SupplierEditor
                        supplier={supplier}
                        onSave={saveSupplier}
                      />
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "orders" && (
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs tracking-[.2em] text-amber-400 uppercase font-bold">
                    Operação
                  </p>
                  <h1 className="text-3xl font-black mt-1">
                    Pedidos e fulfillment
                  </h1>
                  <p className="text-sm text-slate-500 mt-2">
                    O webhook libera o pedido; a criação na CJ exige seu clique
                    e nunca debita o saldo automaticamente.
                  </p>
                </div>
                <button
                  onClick={() => refreshFromServer(accessToken)}
                  className="text-xs text-blue-300"
                >
                  Atualizar
                </button>
              </div>
              {orders.length === 0 ? (
                <Empty
                  title="Nenhum pedido real"
                  text="Pedidos criados pelo checkout aparecerão aqui."
                />
              ) : (
                <div className="rounded-2xl border border-slate-800 overflow-hidden">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-3 bg-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
                    <span>Pedido</span>
                    <span>Pagamento</span>
                    <span>Total</span>
                    <span>Fulfillment</span>
                  </div>
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="grid grid-cols-[1fr_auto_auto_auto] gap-4 p-4 border-t border-slate-800 text-sm items-center"
                    >
                      <div>
                        <strong>#{order.id.slice(0, 8)}</strong>
                        <p className="text-xs text-slate-500 mt-1">
                          {order.customer.name} · {order.items.length} item(ns)
                        </p>
                      </div>
                      <span
                        className={
                          order.paymentStatus === "approved"
                            ? "text-emerald-300"
                            : "text-amber-300"
                        }
                      >
                        {order.paymentStatus}
                      </span>
                      <span className="text-slate-300">
                        {money.format(order.total)}
                      </span>
                      <div className="text-right">
                        <span className="text-blue-300">
                          {order.fulfillmentStatus}
                        </span>
                        {order.fulfillmentStatus === "ready" &&
                          order.items.every(
                            (item) => item.provider === "cj",
                          ) && (
                            <button
                              onClick={() => submitCjOrder(order)}
                              disabled={fulfilling === order.id}
                              className="block mt-1 ml-auto text-[11px] text-emerald-300 disabled:opacity-40"
                            >
                              {fulfilling === order.id
                                ? "Enviando…"
                                : "Criar pedido CJ"}
                            </button>
                          )}
                        {order.supplierOrderId && (
                          <>
                            <p className="text-[10px] text-slate-500 mt-1">
                              CJ #{order.supplierOrderId}
                            </p>
                            <button
                              onClick={() => syncCjOrder(order)}
                              disabled={fulfilling === order.id}
                              className="block mt-1 ml-auto text-[11px] text-blue-300 disabled:opacity-40"
                            >
                              Sincronizar rastreio
                            </button>
                          </>
                        )}
                        {order.trackingNumber && (
                          <p className="text-[10px] text-emerald-300 mt-1">
                            {order.trackingProvider || "Rastreio"}:{" "}
                            {order.trackingUrl ? (
                              <a
                                href={order.trackingUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="underline"
                              >
                                {order.trackingNumber}
                              </a>
                            ) : (
                              order.trackingNumber
                            )}
                          </p>
                        )}
                        {order.lastError && (
                          <p className="text-[10px] text-rose-300 mt-1 max-w-48">
                            {order.lastError}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid md:grid-cols-4 gap-3">
                {[
                  "Pagamento aprovado",
                  "Revalidar preço e estoque",
                  "Criar pedido no fornecedor",
                  "Sincronizar rastreio",
                ].map((step, index) => (
                  <div
                    key={step}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 p-4"
                  >
                    <span className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-300 grid place-items-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <p className="text-sm font-semibold mt-3">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs tracking-[.2em] text-slate-400 uppercase font-bold">
                  Configuração
                </p>
                <h1 className="text-3xl font-black mt-1">Integrações</h1>
                <p className="text-sm text-slate-500 mt-2">
                  O painel mostra somente o estado; as chaves permanecem no
                  servidor.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 max-w-2xl">
                <label className="text-sm font-semibold">
                  Token pessoal do painel
                  <input
                    type="password"
                    value={accessToken}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAccessToken(value);
                      sessionStorage.setItem("dropradar_access", value);
                    }}
                    onBlur={() => refreshFromServer(accessToken)}
                    placeholder="APP_ACCESS_TOKEN configurado no servidor"
                    className="block w-full mt-2 p-3 rounded-xl bg-slate-950 border border-slate-700 text-sm"
                  />
                </label>
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => refreshFromServer(accessToken)}
                    className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
                  >
                    Conectar painel
                  </button>
                  <button
                    onClick={loadDemoOnServer}
                    className="px-3 py-2 rounded-lg border border-slate-700 text-xs"
                  >
                    Carregar dados de demonstração
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-3">
                  Não cole aqui chaves da CJ, Nuvemshop ou Mercado Pago.
                </p>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                {integrations.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex items-start gap-4"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-800">
                      {item.key === "cj" ? (
                        <Boxes className="w-5 h-5 text-blue-300" />
                      ) : item.key === "nuvemshop" ? (
                        <Store className="w-5 h-5 text-emerald-300" />
                      ) : item.key === "mercado-pago" ? (
                        <CircleDollarSign className="w-5 h-5 text-amber-300" />
                      ) : (
                        <Film className="w-5 h-5 text-violet-300" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold">{item.name}</h2>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${item.connected ? "border-emerald-500/30 text-emerald-300" : "border-amber-500/30 text-amber-300"}`}
                        >
                          {item.connected
                            ? "Conectado"
                            : item.configured
                              ? "Pronto para autorizar"
                              : "A configurar"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">
                        {item.detail}
                      </p>
                      {item.requiresUser.map((step) => (
                        <p key={step} className="text-xs text-slate-600 mt-2">
                          • {step}
                        </p>
                      ))}
                      {item.key === "nuvemshop" &&
                        !item.connected &&
                        item.configured && (
                          <button
                            onClick={connectNuvemshop}
                            className="mt-3 px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
                          >
                            Autorizar Nuvemshop
                          </button>
                        )}
                      {item.key === "tiktok" &&
                        !item.connected &&
                        item.configured && (
                          <button
                            onClick={connectTikTok}
                            className="mt-3 px-3 py-2 rounded-lg bg-violet-500 text-white text-xs font-bold"
                          >
                            Autorizar TikTok
                          </button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {editingProduct && (
            <ProductEditor
              product={editingProduct}
              suppliers={suppliers}
              onSave={saveEditedProduct}
              onClose={() => setEditingProduct(null)}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function ComparePanel({
  product,
  products,
  suppliers,
  analyses,
  onSelectProduct,
  onChooseOffer,
  onApprove,
}: {
  product: CommerceProduct;
  products: CommerceProduct[];
  suppliers: CommerceSupplier[];
  analyses: Map<string, ReturnType<typeof analyzeOpportunity>>;
  onSelectProduct: (id: string) => void;
  onChooseOffer: (id: string) => void;
  onApprove: () => void;
}) {
  const analysis = analyses.get(product.id)!;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs tracking-[.2em] text-blue-400 uppercase font-bold">
            Decisão nacional × internacional
          </p>
          <h1 className="text-3xl font-black mt-1">Comparador de ofertas</h1>
          <p className="text-sm text-slate-500 mt-2">
            Custo posto, prazo, risco e margem na mesma unidade.
          </p>
        </div>
        <select
          value={product.id}
          onChange={(e) => onSelectProduct(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm"
        >
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid xl:grid-cols-[.65fr_1.35fr] gap-5">
        <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <div className="flex items-center gap-4">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-20 h-20 rounded-xl object-cover"
            />
            <div>
              <p className="text-xs text-emerald-400">{product.category}</p>
              <h2 className="font-bold text-lg">{product.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-5">
            <ScoreRing value={analysis.opportunityScore} />
            <div>
              <p className="font-bold">Score de oportunidade</p>
              <p className="text-xs text-slate-500">Com pesos ajustáveis</p>
            </div>
          </div>
          <div className="space-y-3 mt-6">
            {[
              ["Economia", analysis.economicsScore],
              ["Demanda", analysis.demandScore],
              ["Fornecedor", analysis.supplierScore],
              ["Logística", analysis.logisticsScore],
              ["Criativo", analysis.creativeScore],
            ].map(([label, value]) => (
              <div key={String(label)}>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">{label}</span>
                  <strong>{value}</strong>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 mt-1">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          {analysis.blockers.map((item) => (
            <p key={item} className="text-xs text-rose-300 mt-3">
              • {item}
            </p>
          ))}
          {analysis.warnings.map((item) => (
            <p key={item} className="text-xs text-amber-300 mt-2">
              • {item}
            </p>
          ))}
        </aside>
        <section className="space-y-4">
          {product.offers.map((offer) => {
            const supplier = suppliers.find((s) => s.id === offer.supplierId);
            const metrics = calculateOfferMetrics(product, offer);
            const chosen =
              (product.selectedOfferId || analysis.bestOfferId) === offer.id;
            return (
              <article
                key={offer.id}
                className={`rounded-2xl border p-5 ${chosen ? "border-emerald-500/50 bg-emerald-500/5" : "border-slate-800 bg-slate-900/60"}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">
                        {supplier?.name || "Fornecedor não cadastrado"}
                      </h2>
                      {chosen && (
                        <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500 text-slate-950 font-bold">
                          ESCOLHIDO
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {supplier?.origin === "national"
                        ? "Nacional"
                        : "Internacional"}{" "}
                      · SKU {offer.sku} · {offer.variant}
                    </p>
                  </div>
                  <button
                    onClick={() => onChooseOffer(offer.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs"
                  >
                    Escolher
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
                  {[
                    ["Produto", money.format(offer.unitCost)],
                    ["Frete", money.format(offer.freight)],
                    ["Custo posto", money.format(metrics.landedCost)],
                    ["Lucro esperado", money.format(metrics.expectedProfit)],
                    ["Margem", `${metrics.marginPercent}%`],
                    [
                      "Prazo",
                      `${offer.deliveryMinDays}–${offer.deliveryMaxDays} dias`,
                    ],
                    [
                      "Estoque",
                      offer.stock == null
                        ? "Não informado"
                        : String(offer.stock),
                    ],
                    [
                      "ROAS equilíbrio",
                      metrics.breakEvenRoas?.toFixed(2) || "—",
                    ],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-950 p-3">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600 block">
                        {label}
                      </span>
                      <strong className="text-sm mt-1 block">{value}</strong>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 text-xs">
                  <span className="text-slate-500">
                    Atualizado em {displayDate(offer.checkedAt)} ·{" "}
                    {offer.apiSynced ? "API" : "manual"}
                  </span>
                  <a
                    href={offer.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 inline-flex items-center gap-1"
                  >
                    Fonte <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      </div>
      <div className="flex justify-end">
        <button
          onClick={onApprove}
          disabled={analysis.blockers.length > 0}
          className="px-5 py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold disabled:opacity-35 inline-flex items-center gap-2"
        >
          <Check className="w-4 h-4" /> Aprovar melhor cenário
        </button>
      </div>
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 p-14 text-center">
      <PackageCheck className="w-10 h-10 mx-auto text-slate-600" />
      <h2 className="font-bold text-lg mt-4">{title}</h2>
      <p className="text-sm text-slate-500 mt-2">{text}</p>
    </div>
  );
}
