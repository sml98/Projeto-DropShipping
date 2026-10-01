import { NextRequest, NextResponse } from "next/server";
import { saveNuvemshopConnection } from "@/lib/server/nuvemshop";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const expected = req.cookies.get("dropradar_nuvemshop_state")?.value || "";
  const clientId = process.env.NUVEMSHOP_CLIENT_ID;
  const clientSecret = process.env.NUVEMSHOP_CLIENT_SECRET;
  const destination = new URL("/", req.url);
  if (!code || !state || state !== expected || !clientId || !clientSecret) {
    destination.searchParams.set("integration", "nuvemshop-error");
    return NextResponse.redirect(destination);
  }
  try {
    const response = await fetch(
      "https://www.nuvemshop.com.br/apps/authorize/token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const data = await response.json();
    if (!response.ok || typeof data.access_token !== "string" || !data.user_id)
      throw new Error("OAuth recusado.");
    saveNuvemshopConnection({
      storeId: String(data.user_id),
      accessToken: data.access_token,
      scope: typeof data.scope === "string" ? data.scope : undefined,
    });
    destination.searchParams.set("integration", "nuvemshop-connected");
    const result = NextResponse.redirect(destination);
    result.cookies.delete("dropradar_nuvemshop_state");
    return result;
  } catch {
    destination.searchParams.set("integration", "nuvemshop-error");
    return NextResponse.redirect(destination);
  }
}
