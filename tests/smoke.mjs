import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
const token = randomBytes(32).toString("hex");
const port = 3197;
const base = `http://127.0.0.1:${port}`;
const child = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "-H",
    "127.0.0.1",
    "-p",
    String(port),
  ],
  {
    env: {
      ...process.env,
      APP_ACCESS_TOKEN: token,
      GEMINI_API_KEY: "",
      TAVILY_API_KEY: "",
    },
    stdio: "ignore",
  },
);
try {
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert.equal(ready, true, "Production server must start");
  assert.equal((await fetch(base + "/loja")).status, 200);
  assert.equal((await fetch(base + "/api/store/products")).status, 200);
  assert.equal((await fetch(base + "/api/admin/state")).status, 401);
  assert.equal(
    (
      await fetch(base + "/api/admin/state", {
        headers: { authorization: `Bearer ${token}` },
      })
    ).status,
    200,
  );
  const session = await fetch(base + "/api/auth/session", {
    method: "POST",
    headers: { authorization: `Bearer ${token}` },
  });
  assert.equal(session.status, 200);
  assert.match(session.headers.get("set-cookie") || "", /dropradar_access/);
  const post = (path, body, access = token) =>
    fetch(base + path, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${access}`,
      },
      body: JSON.stringify(body),
    });
  assert.equal((await post("/api/gerar-oferta", {}, "invalid")).status, 401);
  assert.equal(
    (await post("/api/pesquisar", { query: "", kind: "products" })).status,
    400,
  );
  const search = await post("/api/pesquisar", {
    query: "camiseta",
    kind: "invalid",
  });
  assert.equal(search.status, 400);
  assert.equal(
    (
      await post(
        "/api/pesquisar",
        { query: "camiseta", kind: "products", mode: "automatic" },
        "invalid",
      )
    ).status,
    401,
  );
  const missing = await post("/api/pesquisar", {
    query: "camiseta",
    kind: "products",
    mode: "automatic",
  });
  assert.equal(missing.status, 503);
  assert.match((await missing.json()).error, /TAVILY_API_KEY/);
  const offer = await post("/api/gerar-oferta", {
    productName: "Camiseta",
    keyFeature: "Algodão conforme cotação",
    niche: "Moda",
    audience: "Adultos",
  });
  assert.equal(offer.status, 503);
  assert.match((await offer.json()).error, /GEMINI_API_KEY/);
  const checkout = await post("/api/checkout", {
    items: [{ id: "prod-bottle", quantity: 1 }],
  });
  assert.equal(checkout.status, 503);
  assert.match((await checkout.json()).error, /Mercado Pago/);
  assert.equal(
    (await post("/api/publish/nuvemshop", { product: {} }, "invalid")).status,
    401,
  );
  assert.equal(
    (await post("/api/orders/cj", { orderId: "missing" }, "invalid")).status,
    401,
  );
  assert.equal(
    (await post("/api/orders/cj", { orderId: "missing" })).status,
    400,
  );
  assert.equal(
    (
      await fetch(base + "/api/oauth/nuvemshop/start", {
        headers: { authorization: `Bearer ${token}` },
      })
    ).status,
    503,
  );
  assert.equal(
    (
      await fetch(base + "/api/oauth/tiktok/start", {
        headers: { authorization: `Bearer ${token}` },
      })
    ).status,
    503,
  );
  assert.equal(
    (await post("/api/webhooks/mercado-pago", { data: { id: "123" } })).status,
    503,
  );
  assert.equal(
    (
      await post("/api/pesquisar", {
        query: "a".repeat(9000),
        kind: "products",
      })
    ).status,
    400,
  );
  const free = await fetch(base + "/api/pesquisar", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query: "tênis infantil de rodinha",
      kind: "products",
    }),
  });
  assert.equal(free.status, 200);
  const data = await free.json();
  assert.equal(data.mode, "direct");
  assert.equal(data.links.length, 3);
  assert.equal(
    new URL(data.links[0].url).searchParams.get("q"),
    "tênis infantil de rodinha produto preço Brasil",
  );
  for (let i = 0; i < 29; i++) await post("/api/gerar-oferta", {});
  assert.equal((await post("/api/gerar-oferta", {})).status, 429);
  console.log(
    "Production smoke passed: dashboard, storefront, auth, input limits, missing credentials, quota and commerce routes. No external provider calls.",
  );
} finally {
  child.kill("SIGTERM");
}
