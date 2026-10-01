"use client";
/* eslint-disable @next/next/no-img-element -- supplier media hosts are dynamic and recorded per product */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Loader2,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import type { CommerceProduct, CustomerAddress } from "@/lib/commerce-types";
import { COMMERCE_KEYS } from "@/lib/commerce-storage";

const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});
type Cart = Record<string, number>;
type StoreProduct = CommerceProduct & {
  deliveryEstimate?: { minDays: number; maxDays: number } | null;
};

export function CustomerStorefront() {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [cart, setCart] = useState<Cart>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [customer, setCustomer] = useState<CustomerAddress>({
    name: "",
    email: "",
    phone: "",
    postalCode: "",
    street: "",
    number: "",
    complement: "",
    district: "",
    city: "",
    state: "",
    countryCode: "BR",
  });

  useEffect(() => {
    fetch("/api/store/products")
      .then((response) => response.json())
      .then((data) =>
        setProducts(Array.isArray(data.products) ? data.products : []),
      )
      .catch(() => setProducts([]));
    try {
      setCart(JSON.parse(localStorage.getItem(COMMERCE_KEYS.cart) || "{}"));
    } catch {
      setCart({});
    }
  }, []);

  function updateCart(id: string, quantity: number) {
    const next = { ...cart };
    if (quantity <= 0) delete next[id];
    else next[id] = Math.min(10, quantity);
    setCart(next);
    localStorage.setItem(COMMERCE_KEYS.cart, JSON.stringify(next));
  }

  const items = useMemo(
    () =>
      Object.entries(cart).flatMap(([id, quantity]) => {
        const product = products.find((item) => item.id === id);
        return product ? [{ product, quantity }] : [];
      }),
    [cart, products],
  );
  const total = items.reduce(
    (sum, item) => sum + item.product.targetPrice * item.quantity,
    0,
  );
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  async function checkout() {
    if (!items.length) return;
    setLoading(true);
    setError("");
    try {
      if (!accepted)
        throw new Error(
          "Confirme os dados e a política de privacidade antes de continuar.",
        );
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            quantity: item.quantity,
          })),
          customer,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Checkout indisponível.");
      location.href = data.initPoint;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Checkout indisponível.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f2] text-slate-950">
      <div className="bg-emerald-50 border-b border-emerald-100 text-emerald-950 text-xs text-center px-4 py-2">
        Catálogo curado · confirme variante, prazo e política de troca antes do
        pagamento.
      </div>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 flex items-center gap-4">
          <Link
            href="/"
            className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <strong className="text-lg tracking-tight">Útil Agora</strong>
            <p className="text-[10px] tracking-[.2em] uppercase text-emerald-700">
              Curadoria transparente
            </p>
          </div>
          <nav className="hidden md:flex items-center gap-6 ml-10 text-sm text-slate-600">
            <a href="#produtos">Produtos</a>
            <a href="#compromisso">Nosso compromisso</a>
          </nav>
          <button
            onClick={() => setCartOpen(true)}
            className="ml-auto relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950 text-white text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Carrinho
            {count > 0 && (
              <span className="w-5 h-5 text-[10px] rounded-full bg-emerald-400 text-slate-950 grid place-items-center font-bold">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>
      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-10">
          <div className="rounded-[2rem] bg-slate-950 text-white px-6 py-12 sm:p-16 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl" />
            <div className="relative max-w-2xl">
              <span className="text-xs uppercase tracking-[.22em] text-emerald-300">
                Escolhas com contexto
              </span>
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-4">
                Coisas úteis.
                <br />
                Decisões melhores.
              </h1>
              <p className="text-slate-300 mt-5 max-w-xl">
                Uma seleção enxuta com origem, prazo e condições apresentados
                antes da compra. Sem contadores falsos ou promessas inventadas.
              </p>
              <a
                href="#produtos"
                className="inline-flex mt-7 px-5 py-3 rounded-full bg-emerald-400 text-slate-950 font-bold"
              >
                Explorar produtos
              </a>
            </div>
          </div>
        </section>
        <section
          id="compromisso"
          className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-3 pb-12"
        >
          {[
            [Truck, "Prazo visível", "A estimativa aparece antes da compra."],
            [
              ShieldCheck,
              "Fonte documentada",
              "Cada item mantém origem e data de revisão.",
            ],
            [
              PackageCheck,
              "Curadoria humana",
              "Só publicamos o que foi explicitamente aprovado.",
            ],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Truck;
            return (
              <div
                key={String(title)}
                className="bg-white border border-slate-200 rounded-2xl p-5 flex gap-4"
              >
                <I className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <h2 className="font-bold">{String(title)}</h2>
                  <p className="text-sm text-slate-500 mt-1">{String(text)}</p>
                </div>
              </div>
            );
          })}
        </section>
        <section id="produtos" className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-xs text-emerald-700 uppercase tracking-[.2em] font-bold">
                Catálogo
              </p>
              <h2 className="text-3xl font-black mt-1">
                Selecionados para você
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {products.length} produto(s)
            </p>
          </div>
          {products.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-14 text-center">
              <ShoppingBag className="w-9 h-9 mx-auto text-slate-300" />
              <h3 className="font-bold mt-3">Catálogo em preparação</h3>
              <p className="text-sm text-slate-500 mt-1">
                Os produtos publicados no painel aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <article
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden group"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-emerald-700 font-semibold">
                      {product.category}
                    </p>
                    <h3 className="font-black text-xl mt-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                      {product.utility}
                    </p>
                    <div className="flex items-center justify-between mt-5">
                      <strong className="text-2xl">
                        {money.format(product.targetPrice)}
                      </strong>
                      <button
                        onClick={() => {
                          updateCart(product.id, (cart[product.id] || 0) + 1);
                          setCartOpen(true);
                        }}
                        className="w-11 h-11 rounded-full bg-slate-950 text-white grid place-items-center hover:bg-emerald-700"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-3">
                      Mídia real com origem e direito de uso revisados.
                    </p>
                    {product.deliveryEstimate && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        Entrega estimada: {product.deliveryEstimate.minDays}–
                        {product.deliveryEstimate.maxDays} dias após a
                        confirmação.
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row gap-4 justify-between">
          <div>
            <strong className="text-white">Útil Agora</strong>
            <p className="text-xs mt-1">
              Curadoria operada com fornecedores documentados.
            </p>
          </div>
          <p className="text-xs">
            Preços e disponibilidade são revalidados no checkout.
          </p>
        </div>
      </footer>

      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex justify-end"
          onClick={() => setCartOpen(false)}
        >
          <aside
            className="w-full max-w-lg h-full bg-white p-5 flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center">
              <h2 className="text-xl font-black">Seu pedido</h2>
              <button
                onClick={() => setCartOpen(false)}
                className="ml-auto p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto mt-5 space-y-3">
              {items.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center">
                  Seu carrinho está vazio.
                </p>
              ) : (
                <>
                  {items.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="flex gap-3 border-b border-slate-100 pb-3"
                    >
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm truncate">
                          {product.name}
                        </p>
                        <p className="text-sm text-emerald-700">
                          {money.format(product.targetPrice)}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateCart(product.id, quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-sm">{quantity}</span>
                          <button
                            onClick={() => updateCart(product.id, quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3">
                    <h3 className="font-bold text-sm">Contato e entrega</h3>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {(
                        [
                          ["name", "Nome completo"],
                          ["email", "E-mail"],
                          ["phone", "Telefone"],
                          ["postalCode", "CEP"],
                          ["street", "Rua"],
                          ["number", "Número"],
                          ["complement", "Complemento"],
                          ["district", "Bairro"],
                          ["city", "Cidade"],
                          ["state", "UF"],
                        ] as Array<[keyof CustomerAddress, string]>
                      ).map(([key, label]) => (
                        <label
                          key={key}
                          className={
                            key === "name" || key === "street"
                              ? "col-span-2"
                              : ""
                          }
                        >
                          <span className="text-[10px] text-slate-500">
                            {label}
                          </span>
                          <input
                            value={String(customer[key] || "")}
                            onChange={(event) =>
                              setCustomer((current) => ({
                                ...current,
                                [key]: event.target.value,
                              }))
                            }
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                          />
                        </label>
                      ))}
                    </div>
                    <label className="flex gap-2 items-start mt-3 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={accepted}
                        onChange={(event) => setAccepted(event.target.checked)}
                        className="mt-0.5"
                      />{" "}
                      Confirmo que os dados estão corretos e autorizo seu uso
                      para pagamento, entrega e suporte deste pedido.
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="border-t border-slate-200 pt-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Total</span>
                <strong className="text-xl">{money.format(total)}</strong>
              </div>
              {error && (
                <p className="text-xs text-rose-700 bg-rose-50 rounded-lg p-3 mt-3">
                  {error}
                </p>
              )}
              <button
                onClick={checkout}
                disabled={!items.length || loading || !accepted}
                className="w-full mt-4 py-3 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}{" "}
                Finalizar com Mercado Pago
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3">
                Preço e disponibilidade serão revalidados no servidor.
              </p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
