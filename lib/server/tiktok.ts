import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/server/secrets";
import { getKv, setKv } from "@/lib/server/db";

export type TikTokConnection = {
  accessToken: string;
  refreshToken: string;
  openId: string;
  scope: string;
  accessExpiresAt: number;
  refreshExpiresAt: number;
};

export function getTikTokConnection(): TikTokConnection | null {
  const stored = getKv("tiktok_connection");
  if (!stored) return null;
  try {
    return decryptSecret<TikTokConnection>(stored);
  } catch {
    return null;
  }
}

export function saveTikTokConnection(connection: TikTokConnection) {
  setKv("tiktok_connection", encryptSecret(connection));
}
