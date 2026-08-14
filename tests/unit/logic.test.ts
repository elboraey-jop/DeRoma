import assert from "node:assert/strict";
import test from "node:test";
import { calculateShippingFee, isGovMatch } from "../../src/lib/shippingHelper";
import { formatOrderNumber } from "../../src/lib/orderNumber";
import { getAllowedNextStatuses, getSelectableStatuses, isCashOnDelivery } from "../../src/lib/orderStatus";
import { formatCurrency, sortSizesList, sortVariantsByNumericSize } from "../../src/lib/utils";
import { sanitizeInput } from "../../src/lib/rateLimit";
import { CATALOG_PRODUCTS } from "../../src/lib/productCatalog";

test("formats order numbers with the DeRoma prefix and padding", () => {
  assert.equal(formatOrderNumber(1), "DR-0001");
  assert.equal(formatOrderNumber(1001), "DR-1001");
  assert.equal(formatOrderNumber(10000), "DR-10000");
});

test("formats currency and sorts numeric sizes naturally", () => {
  assert.equal(formatCurrency(1250), "EGP 1,250");
  assert.equal(formatCurrency("bad"), "EGP 0");
  assert.deepEqual(sortSizesList(["10", "2", "ONE_SIZE", "9"]), ["2", "9", "10", "ONE_SIZE"]);
  assert.deepEqual(
    sortVariantsByNumericSize([{ size: "42" }, { size: "9" }, { size: "10" }]),
    [{ size: "9" }, { size: "10" }, { size: "42" }],
  );
});

test("matches governorates case-insensitively", () => {
  assert.equal(isGovMatch("Cairo", "cairo"), true);
  assert.equal(isGovMatch("Cairo", "Giza"), false);
});

test("calculates shipping with free thresholds and city exceptions", () => {
  assert.equal(calculateShippingFee({ governorate: "Cairo", zones: [] }), 50);
  assert.equal(
    calculateShippingFee({
      governorate: "Cairo",
      city: "New Cairo",
      zones: [{ governorates: ["Cairo"], fee: 50, exceptions: [{ city: "New Cairo", fee: 35 }] }],
    }),
    35,
  );
  assert.equal(
    calculateShippingFee({
      governorate: "Cairo",
      subtotal: 1000,
      zones: [{ governorates: ["Cairo"], fee: 50, freeShippingThreshold: 1000 }],
    }),
    0,
  );
  assert.equal(
    calculateShippingFee({
      governorate: "Cairo",
      subtotal: 750,
      zones: [],
      settings: { freeShippingEnabled: true, freeShippingThreshold: 500 },
    }),
    0,
  );
});

test("enforces order status transitions", () => {
  assert.equal(isCashOnDelivery("cod"), true);
  assert.equal(isCashOnDelivery("wallet"), false);
  assert.deepEqual(getAllowedNextStatuses("pending", "cod"), ["confirmed", "cancelled"]);
  assert.deepEqual(getAllowedNextStatuses("pending", "instapay"), ["paid", "cancelled"]);
  assert.deepEqual(getSelectableStatuses("delivered", "cod"), ["delivered", "returned", "cancelled"]);
});

test("sanitizes user-provided text", () => {
  assert.equal(sanitizeInput("  <script>alert(1)</script>  "), "  &lt;script&gt;alert(1)&lt;&#x2F;script&gt;  ");
  assert.equal(sanitizeInput("hello   world"), "hello   world");
});

test("catalog has unique ids and usable product records", () => {
  assert.ok(CATALOG_PRODUCTS.length > 0);
  const ids = CATALOG_PRODUCTS.map((product) => product.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const product of CATALOG_PRODUCTS) {
    assert.ok(product.name.trim());
    assert.ok(product.category.trim());
    assert.ok(product.image.trim());
    assert.ok(product.sizes.length > 0);
  }
});
