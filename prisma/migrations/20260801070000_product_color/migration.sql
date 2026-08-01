-- Move color ownership from individual stock variants to the product.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "color" TEXT;

-- Preserve existing catalog data: each product previously stored the same
-- color on its variants, so the first available variant is a safe source.
UPDATE "Product" AS p
SET "color" = v."color"
FROM (
  SELECT DISTINCT ON ("productId") "productId", "color"
  FROM "ProductVariant"
  WHERE "color" IS NOT NULL AND "color" <> ''
  ORDER BY "productId", "id"
) AS v
WHERE p."id" = v."productId" AND (p."color" IS NULL OR p."color" = '');
