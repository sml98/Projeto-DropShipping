import { NextRequest, NextResponse } from "next/server";
import { guard, readBody } from "@/lib/server/access";
import { calculateCjFreight } from "@/lib/server/cj";
import { getExchangeRates } from "@/lib/exchange-rates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = guard(req, "cj-freight");
  if (denied) return denied;
  try {
    const body = await readBody(req);
    const variantId = String(body.variantId || "");
    const quantity = Math.max(1, Math.min(10, Number(body.quantity || 1)));
    if (!/^[A-Za-z0-9-]{8,200}$/.test(variantId))
      throw new Error("Variante CJ inválida.");
    const raw = await calculateCjFreight({
      variantId,
      quantity,
      destinationCountryCode: "BR",
    });
    const rates = await getExchangeRates(["USD"]);
    const usdBrl =
      rates.rates.find((rate) => rate.currency === "USD")?.rate ||
      Number(process.env.USD_BRL_RATE || 0);
    if (!usdBrl) throw new Error("Cotação USD/BRL indisponível.");
    const rows = Array.isArray(raw)
      ? (raw as Array<Record<string, unknown>>)
      : [];
    const options = rows
      .flatMap((row) => {
        const priceUsd = Number(
          row.totalPostageFee ??
            row.logisticPrice ??
            row.wrapPostage ??
            row.discountFee,
        );
        const name = String(
          row.logisticName ||
            (row.option as Record<string, unknown> | undefined)?.enName ||
            "Frete CJ",
        );
        const aging = String(row.logisticAging || row.arrivalTime || "");
        const days = aging.match(/(\d+)\D+(\d+)/);
        if (!Number.isFinite(priceUsd) || priceUsd <= 0 || !days) return [];
        return [
          {
            name,
            priceUsd,
            priceBrl: Math.round(priceUsd * usdBrl * 100) / 100,
            minDays: Number(days[1]),
            maxDays: Number(days[2]),
          },
        ];
      })
      .sort((a, b) => a.priceBrl - b.priceBrl);
    return NextResponse.json(
      { options, usdBrl, rateDate: rates.rates[0]?.date || null },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Falha no cálculo de frete.",
      },
      { status: 502 },
    );
  }
}
