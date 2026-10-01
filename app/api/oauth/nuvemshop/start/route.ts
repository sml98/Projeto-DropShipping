import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/server/access";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guard(req, "nuvemshop-oauth");
  if (denied) return denied;
  const clientId = process.env.NUVEMSHOP_CLIENT_ID;
  if (!clientId)
    return NextResponse.json(
      { error: "Configure NUVEMSHOP_CLIENT_ID e NUVEMSHOP_CLIENT_SECRET." },
      { status: 503 },
    );
  const state = randomBytes(24).toString("base64url");
  const url = `https://www.nuvemshop.com.br/apps/${encodeURIComponent(clientId)}/authorize?state=${encodeURIComponent(state)}`;
  const response = NextResponse.json({ url });
  response.cookies.set("dropradar_nuvemshop_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return response;
}
