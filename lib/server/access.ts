import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

// Single-user, per-process quota. Use a shared limiter before scaling to multiple instances.
const buckets = new Map<string, { reset: number; count: number }>();
export function guard(req: NextRequest, scope: string): NextResponse | null {
  const expected = process.env.APP_ACCESS_TOKEN;
  if (!expected || expected.length < 24)
    return NextResponse.json(
      {
        error:
          "Configure APP_ACCESS_TOKEN com pelo menos 24 caracteres no servidor.",
      },
      { status: 503 },
    );
  const supplied =
    req.headers.get("authorization")?.replace(/^Bearer /, "") ||
    req.cookies.get("dropradar_access")?.value ||
    "";
  const a = Buffer.from(supplied),
    b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b))
    return NextResponse.json(
      { error: "Informe o token de acesso pessoal na seção Pesquisa." },
      { status: 401 },
    );
  const now = Date.now();
  let bucket = buckets.get(scope);
  if (!bucket || bucket.reset <= now) {
    bucket = { reset: now + 3600000, count: 0 };
    buckets.set(scope, bucket);
  }
  if (bucket.count >= 30)
    return NextResponse.json(
      { error: "Limite pessoal de 30 chamadas por hora atingido." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((bucket.reset - now) / 1000)),
        },
      },
    );
  bucket.count++;
  return null;
}
export async function readBody(
  req: NextRequest,
  maxBytes = 131072,
): Promise<Record<string, unknown>> {
  if (Number(req.headers.get("content-length") || 0) > maxBytes)
    throw new Error("Entrada excede o limite permitido.");
  const reader = req.body?.getReader();
  if (!reader) throw new Error("Corpo obrigatório.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel();
      throw new Error("Entrada excede o limite permitido.");
    }
    chunks.push(value);
  }
  const value: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("JSON inválido.");
  return value as Record<string, unknown>;
}
export function field(
  body: Record<string, unknown>,
  name: string,
  required = false,
  max = 500,
): string {
  const value = body[name];
  if (value == null && !required) return "";
  if (
    typeof value !== "string" ||
    value.length > max ||
    (required && !value.trim())
  )
    throw new Error(`Campo inválido: ${name}.`);
  return value.trim();
}
