import { NextResponse } from "next/server";
import { getPublishedProducts, listEntities } from "@/lib/server/db";
import { analyzeOpportunity, selectBestOffer } from "@/lib/opportunity-engine";
import type { CommerceSupplier } from "@/lib/commerce-types";

export const runtime = "nodejs";

export async function GET() {
  const suppliers = listEntities<CommerceSupplier>("suppliers");
  const products = getPublishedProducts().flatMap((product) => {
    if (analyzeOpportunity(product, suppliers).blockers.length) return [];
    const selected =
      product.offers.find((offer) => offer.id === product.selectedOfferId) ||
      selectBestOffer(product, suppliers);
    return [
      {
        ...product,
        offers: [],
        selectedOfferId: undefined,
        deliveryEstimate: selected
          ? {
              minDays: selected.deliveryMinDays,
              maxDays: selected.deliveryMaxDays,
            }
          : null,
      },
    ];
  });
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=120",
      },
    },
  );
}
