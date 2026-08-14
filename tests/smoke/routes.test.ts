import assert from "node:assert/strict";
import test from "node:test";

const baseUrl = process.env.TEST_BASE_URL || "http://localhost:8080";

async function request(path: string, init?: RequestInit) {
  return fetch(`${baseUrl}${path}`, { redirect: "manual", ...init });
}

test("public pages respond successfully", async () => {
  for (const path of [
    "/",
    "/shop",
    "/shop/accessories",
    "/shop/bags",
    "/shop/perfumes",
    "/about",
    "/contact",
    "/track",
    "/checkout",
    "/checkout/success",
    "/wishlist",
    "/login",
    "/profile",
    "/privacy",
    "/terms",
    "/refund-policy",
    "/admin/login",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
    assert.match(response.headers.get("content-type") || "", /text\/html/);
  }
});

test("SEO endpoints are available", async () => {
  for (const path of ["/robots.txt", "/sitemap.xml"]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
  }
});

test("public data APIs respond without exposing admin routes", async () => {
  for (const path of ["/api/site-settings", "/api/shipping", "/api/catalog/feed", "/api/meta-catalog"]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} returned ${response.status}`);
  }

  const adminResponse = await request("/admin");
  assert.ok([307, 308].includes(adminResponse.status), `/admin returned ${adminResponse.status}`);
});

test("promotion validation rejects malformed anonymous input", async () => {
  const response = await request("/api/promotions/validate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({}),
  });
  assert.ok([400, 422].includes(response.status), `promotion API returned ${response.status}`);
});
