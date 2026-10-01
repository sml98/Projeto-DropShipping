"use client";

import { useState } from "react";
import { Check, Plus, Trash2, X } from "lucide-react";
import type {
  CommerceProduct,
  CommerceSupplier,
  MediaRights,
} from "@/lib/commerce-types";

const input =
  "w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm";
const rights: Array<[MediaRights, string]> = [
  ["unknown", "Não confirmado"],
  ["supplier-authorized", "Autorizado pelo fornecedor"],
  ["licensed", "Licenciado"],
  ["owned", "Produção própria"],
];

export function ProductEditor({
  product,
  suppliers,
  onSave,
  onClose,
}: {
  product: CommerceProduct;
  suppliers: CommerceSupplier[];
  onSave: (product: CommerceProduct) => Promise<void>;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<CommerceProduct>(() =>
    structuredClone(product),
  );
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [freightOptions, setFreightOptions] = useState<
    Record<
      number,
      Array<{
        name: string;
        priceBrl: number;
        minDays: number;
        maxDays: number;
      }>
    >
  >({});
  const set = <K extends keyof CommerceProduct>(
    key: K,
    value: CommerceProduct[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const setDemand = (
    key: keyof CommerceProduct["demand"],
    value: string | number,
  ) =>
    setDraft((current) => ({
      ...current,
      demand: { ...current.demand, [key]: value },
    }));
  const setOffer = (
    index: number,
    key: string,
    value: string | number | null,
  ) =>
    setDraft((current) => ({
      ...current,
      offers: current.offers.map((offer, i) =>
        i === index ? { ...offer, [key]: value } : offer,
      ),
    }));
  const setMedia = (index: number, key: string, value: string) =>
    setDraft((current) => ({
      ...current,
      media: (current.media || []).map((item, i) =>
        i === index ? { ...item, [key]: value } : item,
      ),
    }));
  function addMedia() {
    const now = new Date().toISOString();
    setDraft((current) => ({
      ...current,
      media: [
        ...(current.media || []),
        {
          id: `media-${crypto.randomUUID()}`,
          kind: "image",
          url: "https://",
          sourceUrl: "https://",
          rights: current.mediaRights,
          licenseNote: "Registrar a autorização ou licença antes de publicar.",
          checkedAt: now,
        },
      ],
    }));
  }
  function removeMedia(index: number) {
    setDraft((current) => ({
      ...current,
      media: (current.media || []).filter((_, i) => i !== index),
    }));
  }
  async function quoteFreight(index: number, variantId: string) {
    setError("");
    try {
      const response = await fetch("/api/connectors/cj/freight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Frete indisponível.");
      setFreightOptions((current) => ({
        ...current,
        [index]: data.options || [],
      }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha no frete.");
    }
  }
  function chooseFreight(index: number, value: string) {
    const option = freightOptions[index]?.[Number(value)];
    if (!option) return;
    setOffer(index, "freight", option.priceBrl);
    setOffer(index, "deliveryMinDays", option.minDays);
    setOffer(index, "deliveryMaxDays", option.maxDays);
    setOffer(index, "providerLogisticName", option.name);
  }
  async function save() {
    setSaving(true);
    setError("");
    try {
      const next = {
        ...draft,
        media: draft.media?.map((item) => ({
          ...item,
          rights: draft.mediaRights,
        })),
      };
      if (verified)
        next.offers = next.offers.map((offer) => ({
          ...offer,
          checkedAt: new Date().toISOString(),
        }));
      await onSave(next);
      onClose();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/70 p-4 overflow-y-auto">
      <div className="max-w-5xl mx-auto my-6 rounded-2xl border border-slate-700 bg-slate-900 p-5">
        <div className="flex items-start">
          <div>
            <h2 className="text-xl font-black">Revisar produto real</h2>
            <p className="text-xs text-slate-500 mt-1">
              Complete custos, demanda e direito de mídia antes de aprovar.
            </p>
          </div>
          <button onClick={onClose} className="ml-auto p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <label>
            Nome
            <input
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={input}
            />
          </label>
          <label>
            Categoria
            <input
              value={draft.category}
              onChange={(e) => set("category", e.target.value)}
              className={input}
            />
          </label>
          <label className="md:col-span-2">
            Utilidade comprovável
            <textarea
              value={draft.utility}
              onChange={(e) => set("utility", e.target.value)}
              className={`${input} min-h-20`}
            />
          </label>
          <label className="md:col-span-2">
            Resumo
            <textarea
              value={draft.summary}
              onChange={(e) => set("summary", e.target.value)}
              className={`${input} min-h-20`}
            />
          </label>
          <label>
            Imagem principal real
            <input
              type="url"
              value={draft.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              className={input}
              placeholder="https://..."
            />
          </label>
          <label>
            Fonte da imagem
            <input
              type="url"
              value={draft.imageSourceUrl}
              onChange={(e) => set("imageSourceUrl", e.target.value)}
              className={input}
              placeholder="https://página-do-fornecedor..."
            />
          </label>
          <label>
            Preço de venda
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.targetPrice}
              onChange={(e) => set("targetPrice", Number(e.target.value))}
              className={input}
            />
          </label>
          <label>
            CPA estimado
            <input
              type="number"
              min="0"
              step="0.01"
              value={draft.estimatedCpa}
              onChange={(e) => set("estimatedCpa", Number(e.target.value))}
              className={input}
            />
          </label>
          <label>
            Impostos (%)
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={draft.taxPercent}
              onChange={(e) => set("taxPercent", Number(e.target.value))}
              className={input}
            />
          </label>
          <label>
            Direito de fotos e vídeos
            <select
              value={draft.mediaRights}
              onChange={(e) =>
                set("mediaRights", e.target.value as MediaRights)
              }
              className={input}
            >
              {rights.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Força de busca (0–100)
            <input
              type="number"
              min="0"
              max="100"
              value={draft.demand.searchMomentum}
              onChange={(e) =>
                setDemand("searchMomentum", Number(e.target.value))
              }
              className={input}
            />
          </label>
          <label>
            Força social (0–100)
            <input
              type="number"
              min="0"
              max="100"
              value={draft.demand.socialMomentum}
              onChange={(e) =>
                setDemand("socialMomentum", Number(e.target.value))
              }
              className={input}
            />
          </label>
          <label>
            Nota verificada (0–5)
            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={draft.demand.reviewQuality}
              onChange={(e) =>
                setDemand("reviewQuality", Number(e.target.value))
              }
              className={input}
            />
          </label>
          <label>
            Quantidade de avaliações
            <input
              type="number"
              min="0"
              value={draft.demand.reviewCount}
              onChange={(e) => setDemand("reviewCount", Number(e.target.value))}
              className={input}
            />
          </label>
          <label>
            Evidências de demanda
            <input
              type="number"
              min="0"
              value={draft.demand.evidenceCount}
              onChange={(e) =>
                setDemand("evidenceCount", Number(e.target.value))
              }
              className={input}
            />
          </label>
          <label className="md:col-span-2">
            Nota e fontes de demanda
            <textarea
              value={draft.demand.note}
              onChange={(e) => setDemand("note", e.target.value)}
              className={`${input} min-h-20`}
            />
          </label>
        </div>
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">Fotos e vídeos reais</h3>
              <p className="text-xs text-slate-500 mt-1">
                Salve a URL exata, a página de origem e a prova da licença de
                cada arquivo.
              </p>
            </div>
            <button
              type="button"
              onClick={addMedia}
              className="px-3 py-2 rounded-lg border border-slate-700 text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Adicionar mídia
            </button>
          </div>
          {(draft.media || []).map((media, index) => (
            <div
              key={media.id}
              className="rounded-xl border border-slate-800 p-4 grid md:grid-cols-2 gap-3"
            >
              <label>
                Tipo
                <select
                  value={media.kind}
                  onChange={(e) => setMedia(index, "kind", e.target.value)}
                  className={input}
                >
                  <option value="image">Foto</option>
                  <option value="video">Vídeo</option>
                </select>
              </label>
              <label>
                URL da mídia
                <input
                  type="url"
                  value={media.url}
                  onChange={(e) => setMedia(index, "url", e.target.value)}
                  className={input}
                />
              </label>
              <label>
                Página de origem
                <input
                  type="url"
                  value={media.sourceUrl}
                  onChange={(e) => setMedia(index, "sourceUrl", e.target.value)}
                  className={input}
                />
              </label>
              <label>
                Prova/observação da licença
                <input
                  value={media.licenseNote}
                  onChange={(e) =>
                    setMedia(index, "licenseNote", e.target.value)
                  }
                  className={input}
                />
              </label>
              <button
                type="button"
                onClick={() => removeMedia(index)}
                className="md:col-span-2 justify-self-end text-xs text-rose-300 inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remover
              </button>
            </div>
          ))}
        </div>
        <div className="space-y-4 mt-6">
          <h3 className="font-bold">Ofertas e custo posto</h3>
          {draft.offers.map((offer, index) => (
            <div
              key={offer.id}
              className="rounded-xl border border-slate-800 p-4"
            >
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <label>
                  Fornecedor
                  <select
                    value={offer.supplierId}
                    onChange={(e) =>
                      setOffer(index, "supplierId", e.target.value)
                    }
                    className={input}
                  >
                    {suppliers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  SKU
                  <input
                    value={offer.sku}
                    onChange={(e) => setOffer(index, "sku", e.target.value)}
                    className={input}
                  />
                </label>
                <label>
                  Variante
                  <input
                    value={offer.variant}
                    onChange={(e) => setOffer(index, "variant", e.target.value)}
                    className={input}
                  />
                </label>
                <label>
                  Estoque
                  <input
                    type="number"
                    min="0"
                    value={offer.stock ?? ""}
                    onChange={(e) =>
                      setOffer(
                        index,
                        "stock",
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    className={input}
                  />
                </label>
                {(
                  [
                    ["unitCost", "Produto"],
                    ["freight", "Frete"],
                    ["importCharges", "Importação"],
                    ["exchangeCharges", "Câmbio"],
                    ["paymentFees", "Pagamento"],
                    ["otherCosts", "Outros"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={offer[key]}
                      onChange={(e) =>
                        setOffer(index, key, Number(e.target.value))
                      }
                      className={input}
                    />
                  </label>
                ))}
                <label>
                  Prazo mínimo
                  <input
                    type="number"
                    min="0"
                    value={offer.deliveryMinDays}
                    onChange={(e) =>
                      setOffer(index, "deliveryMinDays", Number(e.target.value))
                    }
                    className={input}
                  />
                </label>
                <label>
                  Prazo máximo
                  <input
                    type="number"
                    min="0"
                    value={offer.deliveryMaxDays}
                    onChange={(e) =>
                      setOffer(index, "deliveryMaxDays", Number(e.target.value))
                    }
                    className={input}
                  />
                </label>
                <label>
                  Pedido mínimo
                  <input
                    type="number"
                    min="1"
                    value={offer.minOrder}
                    onChange={(e) =>
                      setOffer(index, "minOrder", Number(e.target.value))
                    }
                    className={input}
                  />
                </label>
                <label>
                  Reserva para devolução (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={offer.returnRiskPercent}
                    onChange={(e) =>
                      setOffer(
                        index,
                        "returnRiskPercent",
                        Number(e.target.value),
                      )
                    }
                    className={input}
                  />
                </label>
                <label className="sm:col-span-2">
                  URL exata da oferta
                  <input
                    type="url"
                    value={offer.sourceUrl}
                    onChange={(e) =>
                      setOffer(index, "sourceUrl", e.target.value)
                    }
                    className={input}
                  />
                </label>
              </div>
              <a
                href={offer.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-300 mt-3 inline-block"
              >
                Abrir fonte para conferência
              </a>
              {offer.provider === "cj" && offer.providerVariantId && (
                <div className="flex flex-wrap items-end gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      quoteFreight(index, offer.providerVariantId!)
                    }
                    className="px-3 py-2 rounded-lg border border-blue-500/30 text-blue-300 text-xs"
                  >
                    Calcular frete CJ para o Brasil
                  </button>
                  {freightOptions[index] && (
                    <label className="text-xs">
                      Opções reais
                      <select
                        defaultValue=""
                        onChange={(event) =>
                          chooseFreight(index, event.target.value)
                        }
                        className={input}
                      >
                        <option value="" disabled>
                          Escolher frete
                        </option>
                        {freightOptions[index].map((option, optionIndex) => (
                          <option
                            key={`${option.name}-${optionIndex}`}
                            value={optionIndex}
                          >
                            {option.name} · R$ {option.priceBrl.toFixed(2)} ·{" "}
                            {option.minDays}–{option.maxDays} dias
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
        <label className="flex gap-2 mt-5 text-sm text-amber-200">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />{" "}
          Conferi agora SKU, variante, preço, estoque e prazo na fonte.
          Atualizar a data de verificação.
        </label>
        {draft.mediaRights !== "unknown" && (
          <p className="text-xs text-amber-300 mt-3">
            Ao salvar, você declara que possui autorização/licença aplicável às
            mídias importadas deste produto.
          </p>
        )}
        {error && <p className="text-sm text-rose-300 mt-4">{error}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-700"
          >
            Cancelar
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold inline-flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            {saving ? "Salvando…" : "Salvar revisão"}
          </button>
        </div>
      </div>
    </div>
  );
}
