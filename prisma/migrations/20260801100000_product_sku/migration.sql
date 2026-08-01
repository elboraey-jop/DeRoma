-- One SKU belongs to the product; sizes only control stock underneath it.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sku" TEXT;
UPDATE "Product" SET "sku" = 'DR-' || upper(replace("id", '-', '')) WHERE "sku" IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "Product_sku_key" ON "Product"("sku");
