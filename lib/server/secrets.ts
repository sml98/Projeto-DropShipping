import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "node:crypto";

function key() {
  const source = process.env.APP_ENCRYPTION_KEY || process.env.APP_ACCESS_TOKEN;
  if (!source || source.length < 24)
    throw new Error(
      "Configure APP_ENCRYPTION_KEY ou APP_ACCESS_TOKEN com pelo menos 24 caracteres.",
    );
  return createHash("sha256").update(source).digest();
}

export function encryptSecret(value: unknown) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return [
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function decryptSecret<T>(value: string): T {
  const [ivText, tagText, payloadText] = value.split(".");
  if (!ivText || !tagText || !payloadText)
    throw new Error("Segredo armazenado inválido.");
  const decipher = createDecipheriv(
    "aes-256-gcm",
    key(),
    Buffer.from(ivText, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagText, "base64url"));
  const clear = Buffer.concat([
    decipher.update(Buffer.from(payloadText, "base64url")),
    decipher.final(),
  ]).toString("utf8");
  return JSON.parse(clear) as T;
}
