import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/server/access";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guard(req, "tiktok-oauth");
  if (denied) return denied;
  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const baseUrl = process.env.STORE_BASE_URL?.replace(/\/$/, "");
  if (
    !clientKey ||
    !process.env.TIKTOK_CLIENT_SECRET ||
    !baseUrl?.startsWith("https://")
  )
    return NextResponse.json(
      {
        error:
          "Configure TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET e STORE_BASE_URL HTTPS.",
      },
      { status: 503 },
    );
  const state = randomBytes(24).toString("base64url");
  const redirectUri = `${baseUrl}/api/oauth/tiktok/callback`;
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: "user.info.basic,video.publish,video.upload",
    redirect_uri: redirectUri,
    state,
  });
  const response = NextResponse.json({
    url: `https://www.tiktok.com/v2/auth/authorize/?${params}`,
    redirectUri,
  });
  response.cookies.set("dropradar_tiktok_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
