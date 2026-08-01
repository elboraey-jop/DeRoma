-- Product color is now owned by Product. OrderItem keeps its historical
-- snapshot independently, so the variant-level color column is no longer needed.
ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "color";
