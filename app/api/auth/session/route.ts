import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/server/access";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const denied = guard(req, "session");
  if (denied) return denied;
  const token = req.headers.get("authorization")?.replace(/^Bearer /, "") || "";
  const response = NextResponse.json({ ok: true });
  response.cookies.set("dropradar_access", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 3600,
  });
  return response;
}
