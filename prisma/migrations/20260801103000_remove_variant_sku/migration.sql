-- SKU is owned by Product; ProductVariant records only size and stock.
ALTER TABLE "ProductVariant" DROP COLUMN IF EXISTS "sku";
