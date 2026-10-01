import "server-only";

import { decryptSecret, encryptSecret } from "@/lib/server/secrets";
import { getKv, setKv } from "@/lib/server/db";

type NuvemshopConnection = {
  storeId: string;
  accessToken: string;
  scope?: string;
};

export function getNuvemshopConnection(): NuvemshopConnection | null {
  if (process.env.NUVEMSHOP_STORE_ID && process.env.NUVEMSHOP_ACCESS_TOKEN)
    return {
      storeId: process.env.NUVEMSHOP_STORE_ID,
      accessToken: process.env.NUVEMSHOP_ACCESS_TOKEN,
    };
  const stored = getKv("nuvemshop_connection");
  if (!stored) return null;
  try {
    return decryptSecret<NuvemshopConnection>(stored);
  } catch {
    return null;
  }
}

export function saveNuvemshopConnection(connection: NuvemshopConnection) {
  setKv("nuvemshop_connection", encryptSecret(connection));
}

export function nuvemshopHeaders(accessToken: string) {
  const contact = process.env.APP_CONTACT_EMAIL?.trim();
  if (!contact || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact))
    throw new Error("Configure APP_CONTACT_EMAIL antes de publicar.");
  return {
    Authentication: `bearer ${accessToken}`,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "User-Agent": `DropRadar OS (${contact})`,
  };
}
