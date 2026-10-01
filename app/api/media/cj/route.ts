import { NextRequest, NextResponse } from "next/server";
import { guard } from "@/lib/server/access";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const denied = guard(req, "cj-media");
  if (denied) return denied;
  try {
    const source = new URL(req.nextUrl.searchParams.get("url") || "");
    if (
      source.protocol !== "https:" ||
      source.hostname !== "download-only-api.cjdropshipping.com"
    )
      throw new Error("URL não permitida.");
    const range = req.headers.get("range");
    const response = await fetch(source, {
      headers: {
        Referer: "https://developers.cjdropshipping.com/",
        ...(range ? { Range: range } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok && response.status !== 206)
      return NextResponse.json(
        { error: "Vídeo indisponível." },
        { status: 502 },
      );
    const headers = new Headers({
      "Content-Type": response.headers.get("content-type") || "video/mp4",
      "Cache-Control": "private, max-age=3600",
      "Accept-Ranges": "bytes",
      "X-Content-Type-Options": "nosniff",
    });
    for (const name of ["content-length", "content-range"]) {
      const value = response.headers.get(name);
      if (value) headers.set(name, value);
    }
    return new NextResponse(response.body, {
      status: response.status,
      headers,
    });
  } catch {
    return NextResponse.json({ error: "Mídia inválida." }, { status: 400 });
  }
}
