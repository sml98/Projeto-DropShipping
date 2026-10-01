"use client";

import { useState } from "react";
import type { CommerceSupplier, VerificationLevel } from "@/lib/commerce-types";

const input =
  "w-full mt-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm";

export function SupplierEditor({
  supplier,
  onSave,
}: {
  supplier?: CommerceSupplier;
  onSave: (supplier: CommerceSupplier) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(supplier?.name || "");
  const [country, setCountry] = useState(supplier?.country || "Brasil");
  const [origin, setOrigin] = useState<"national" | "international">(
    supplier?.origin || "national",
  );
  const [verification, setVerification] = useState<VerificationLevel>(
    supplier?.verification || "unverified",
  );
  const [rating, setRating] = useState(
    supplier?.rating == null ? "" : String(supplier.rating),
  );
  const [reviewsCount, setReviewsCount] = useState(
    supplier?.reviewsCount == null ? "" : String(supplier.reviewsCount),
  );
  const [invoiceConfirmed, setInvoiceConfirmed] = useState(
    supplier?.invoiceConfirmed || false,
  );
  const [returnsConfirmed, setReturnsConfirmed] = useState(
    supplier?.returnsConfirmed || false,
  );
  const [trackingConfirmed, setTrackingConfirmed] = useState(
    supplier?.trackingConfirmed || false,
  );
  const [evidenceLabel, setEvidenceLabel] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");

  async function save() {
    setError("");
    try {
      if (!name.trim()) throw new Error("Informe o nome do fornecedor.");
      if (!supplier && !evidenceUrl.startsWith("https://"))
        throw new Error("O primeiro link de evidência é obrigatório.");
      if (evidenceUrl) new URL(evidenceUrl);
      const now = new Date().toISOString();
      const evidence = [
        ...(supplier?.evidence || []),
        ...(evidenceUrl
          ? [
              {
                label:
                  evidenceLabel.trim() ||
                  "Evidência adicionada durante a revisão",
                url: evidenceUrl,
                checkedAt: now,
              },
            ]
          : []),
      ];
      await onSave({
        id: supplier?.id || `supplier-${crypto.randomUUID()}`,
        name: name.trim(),
        country: country.trim(),
        origin,
        integration: supplier?.integration || "manual",
        verification,
        rating: rating === "" ? undefined : Number(rating),
        reviewsCount: reviewsCount === "" ? undefined : Number(reviewsCount),
        sampleOrderAt:
          verification === "sample-tested"
            ? supplier?.sampleOrderAt || now
            : supplier?.sampleOrderAt,
        invoiceConfirmed,
        returnsConfirmed,
        trackingConfirmed,
        evidence,
      });
      setOpen(false);
      setEvidenceLabel("");
      setEvidenceUrl("");
      if (!supplier) setName("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dados inválidos.");
    }
  }

  if (!open)
    return (
      <button
        onClick={() => setOpen(true)}
        className={
          supplier
            ? "mt-4 text-xs text-blue-300"
            : "px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-bold"
        }
      >
        {supplier ? "Revisar fornecedor" : "Cadastrar fornecedor"}
      </button>
    );

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4">
      <h3 className="font-bold">
        {supplier ? `Revisar ${supplier.name}` : "Novo fornecedor"}
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
        <label>
          Nome
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={input}
          />
        </label>
        <label>
          País
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={input}
          />
        </label>
        <label>
          Origem
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value as typeof origin)}
            className={input}
          >
            <option value="national">Nacional</option>
            <option value="international">Internacional</option>
          </select>
        </label>
        <label>
          Verificação
          <select
            value={verification}
            onChange={(e) =>
              setVerification(e.target.value as VerificationLevel)
            }
            className={input}
          >
            <option value="unverified">Não verificado</option>
            <option value="documented">Documentado</option>
            <option value="sample-tested">Pedido-amostra testado</option>
            <option value="audited">Auditado</option>
          </select>
        </label>
        <label>
          Nota na fonte (0–5)
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className={input}
          />
        </label>
        <label>
          Número de avaliações
          <input
            type="number"
            min="0"
            value={reviewsCount}
            onChange={(e) => setReviewsCount(e.target.value)}
            className={input}
          />
        </label>
        <label>
          Rótulo da nova evidência
          <input
            value={evidenceLabel}
            onChange={(e) => setEvidenceLabel(e.target.value)}
            placeholder="Política de devolução, Reclame Aqui…"
            className={input}
          />
        </label>
        <label>
          Link da nova evidência
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://"
            className={input}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-4 mt-4 text-sm">
        {[
          ["Emite nota fiscal", invoiceConfirmed, setInvoiceConfirmed],
          ["Rastreio testado", trackingConfirmed, setTrackingConfirmed],
          ["Devolução testada", returnsConfirmed, setReturnsConfirmed],
        ].map(([label, checked, setter]) => (
          <label key={String(label)} className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={Boolean(checked)}
              onChange={(event) =>
                (setter as (value: boolean) => void)(event.target.checked)
              }
            />
            {String(label)}
          </label>
        ))}
      </div>
      <p className="text-[11px] text-amber-300 mt-3">
        Registre apenas nota, quantidade e verificações observadas na fonte ou
        no seu pedido-amostra.
      </p>
      {error && <p className="text-xs text-rose-300 mt-2">{error}</p>}
      <div className="flex gap-2 mt-4">
        <button
          onClick={save}
          className="px-3 py-2 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold"
        >
          Salvar revisão
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-3 py-2 text-xs text-slate-400"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
