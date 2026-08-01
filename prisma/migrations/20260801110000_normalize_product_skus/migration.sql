-- Normalize every existing product to the category-based sequential SKU format.
-- Temporary unique values avoid collisions with the Product.sku unique index.
UPDATE "Product"
SET "sku" = '__legacy_sku__' || "id";

WITH ranked AS (
  SELECT
    "id",
    "category",
    ROW_NUMBER() OVER (PARTITION BY "category" ORDER BY "createdAt" ASC, "id" ASC) AS sequence
  FROM "Product"
)
UPDATE "Product" AS product
SET "sku" = CASE ranked."category"
  WHEN 'shoes' THEN 'S'
  WHEN 'bags' THEN 'B'
  WHEN 'perfumes' THEN 'P'
  WHEN 'accessories' THEN 'A'
  ELSE 'A'
END || LPAD(ranked.sequence::text, 4, '0')
FROM ranked
WHERE product."id" = ranked."id";
