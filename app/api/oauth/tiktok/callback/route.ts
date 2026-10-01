import { NextRequest, NextResponse } from "next/server";
import { saveTikTokConnection } from "@/lib/server/tiktok";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code") || "";
  const state = req.nextUrl.searchParams.get("state") || "";
  const expected = req.cookies.get("dropradar_tiktok_state")?.value || "";
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const baseUrl = process.env.STORE_BASE_URL?.replace(/\/$/, "");
  const destination = new URL("/", req.url);
  if (
    !code ||
    !state ||
    state !== expected ||
    !clientKey ||
    !clientSecret ||
    !baseUrl?.startsWith("https://")
  ) {
    destination.searchParams.set("integration", "tiktok-error");
    return NextResponse.redirect(destination);
  }
  try {
    const redirectUri = `${baseUrl}/api/oauth/tiktok/callback`;
    const response = await fetch(
      "https://open.tiktokapis.com/v2/oauth/token/",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      },
    );
    const data = await response.json();
    if (
      !response.ok ||
      typeof data.access_token !== "string" ||
      typeof data.refresh_token !== "string" ||
      typeof data.open_id !== "string"
    )
      throw new Error("OAuth recusado.");
    const now = Date.now();
    saveTikTokConnection({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      openId: data.open_id,
      scope: typeof data.scope === "string" ? data.scope : "",
      accessExpiresAt: now + Number(data.expires_in || 0) * 1000,
      refreshExpiresAt: now + Number(data.refresh_expires_in || 0) * 1000,
    });
    destination.searchParams.set("integration", "tiktok-connected");
    const result = NextResponse.redirect(destination);
    result.cookies.delete("dropradar_tiktok_state");
    return result;
  } catch {
    destination.searchParams.set("integration", "tiktok-error");
    return NextResponse.redirect(destination);
  }
}
