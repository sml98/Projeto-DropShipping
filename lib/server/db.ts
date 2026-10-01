import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type {
  CommerceOrder,
  CommerceProduct,
  CommerceSupplier,
  CreativeDraft,
} from "@/lib/commerce-types";
import {
  DEMO_CREATIVES,
  DEMO_PRODUCTS,
  DEMO_SUPPLIERS,
} from "@/lib/data/commerceDemo";

type Entity = CommerceProduct | CommerceSupplier | CreativeDraft;
type Table = "products" | "suppliers" | "creatives";
type JsonRow = { payload: string };

const globalDb = globalThis as typeof globalThis & {
  __dropRadarDb?: DatabaseSync;
};

function createDatabase() {
  const configured = process.env.DATABASE_PATH?.trim();
  const filename =
    configured || path.join(process.cwd(), "data", "dropradar.sqlite");
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS suppliers (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS creatives (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, external_reference TEXT NOT NULL UNIQUE, payment_id TEXT UNIQUE, payload TEXT NOT NULL, updated_at TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS webhook_events (provider TEXT NOT NULL, event_id TEXT NOT NULL, received_at TEXT NOT NULL, payload TEXT NOT NULL, PRIMARY KEY(provider, event_id));
    CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
  `);
  return db;
}

export function database() {
  if (!globalDb.__dropRadarDb) globalDb.__dropRadarDb = createDatabase();
  return globalDb.__dropRadarDb;
}

function parse<T>(row: unknown): T | null {
  if (
    !row ||
    typeof row !== "object" ||
    typeof (row as JsonRow).payload !== "string"
  )
    return null;
  try {
    return JSON.parse((row as JsonRow).payload) as T;
  } catch {
    return null;
  }
}

export function listEntities<T extends Entity>(table: Table): T[] {
  return database()
    .prepare(`SELECT payload FROM ${table} ORDER BY updated_at DESC`)
    .all()
    .flatMap((row) => {
      const value = parse<T>(row);
      return value ? [value] : [];
    });
}

export function getEntity<T extends Entity>(
  table: Table,
  id: string,
): T | null {
  return parse<T>(
    database().prepare(`SELECT payload FROM ${table} WHERE id = ?`).get(id),
  );
}

export function upsertEntity<T extends Entity>(table: Table, value: T) {
  const now = new Date().toISOString();
  database()
    .prepare(
      `INSERT INTO ${table}(id,payload,updated_at) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at`,
    )
    .run(value.id, JSON.stringify(value), now);
  return value;
}

export function deleteEntity(table: Table, id: string) {
  return (
    Number(
      database().prepare(`DELETE FROM ${table} WHERE id = ?`).run(id).changes,
    ) > 0
  );
}

export function replaceEntities<T extends Entity>(table: Table, values: T[]) {
  const db = database();
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`DELETE FROM ${table}`);
    const insert = db.prepare(
      `INSERT INTO ${table}(id,payload,updated_at) VALUES(?,?,?)`,
    );
    const now = new Date().toISOString();
    values.forEach((value) => insert.run(value.id, JSON.stringify(value), now));
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function loadDemoData() {
  replaceEntities("suppliers", DEMO_SUPPLIERS);
  replaceEntities("products", DEMO_PRODUCTS);
  replaceEntities("creatives", DEMO_CREATIVES);
}

export function clearDemoData() {
  const db = database();
  for (const table of ["products", "suppliers", "creatives"] as Table[]) {
    db.prepare(`DELETE FROM ${table} WHERE id LIKE ? OR id LIKE ?`).run(
      "prod-%",
      "creative-%",
    );
  }
  db.prepare("DELETE FROM suppliers WHERE id LIKE ?").run("sup-%");
}

export function getPublishedProducts() {
  return listEntities<CommerceProduct>("products").filter(
    (product) => product.status === "published",
  );
}

export function getOrder(id: string) {
  return parse<CommerceOrder>(
    database()
      .prepare(
        "SELECT payload FROM orders WHERE id = ? OR external_reference = ?",
      )
      .get(id, id),
  );
}

export function getOrderByPaymentId(paymentId: string) {
  return parse<CommerceOrder>(
    database()
      .prepare("SELECT payload FROM orders WHERE payment_id = ?")
      .get(paymentId),
  );
}

export function listOrders() {
  return database()
    .prepare("SELECT payload FROM orders ORDER BY updated_at DESC")
    .all()
    .flatMap((row) => {
      const value = parse<CommerceOrder>(row);
      return value ? [value] : [];
    });
}

export function upsertOrder(order: CommerceOrder) {
  database()
    .prepare(
      `INSERT INTO orders(id,external_reference,payment_id,payload,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET external_reference=excluded.external_reference,payment_id=excluded.payment_id,payload=excluded.payload,updated_at=excluded.updated_at`,
    )
    .run(
      order.id,
      order.externalReference,
      order.paymentId || null,
      JSON.stringify(order),
      order.updatedAt,
    );
  return order;
}

export function recordWebhook(
  provider: string,
  eventId: string,
  payload: unknown,
) {
  try {
    database()
      .prepare(
        "INSERT INTO webhook_events(provider,event_id,received_at,payload) VALUES(?,?,?,?)",
      )
      .run(
        provider,
        eventId,
        new Date().toISOString(),
        JSON.stringify(payload),
      );
    return true;
  } catch {
    return false;
  }
}

export function getKv(key: string) {
  const row = database()
    .prepare("SELECT value FROM kv WHERE key = ?")
    .get(key) as { value?: string } | undefined;
  return row?.value || null;
}

export function setKv(key: string, value: string) {
  database()
    .prepare(
      `INSERT INTO kv(key,value,updated_at) VALUES(?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value,updated_at=excluded.updated_at`,
    )
    .run(key, value, new Date().toISOString());
}
