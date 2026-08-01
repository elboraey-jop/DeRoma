ALTER TABLE "ProductVariant"
  ADD COLUMN "price" DECIMAL(65, 30),
  ADD COLUMN "compareAtPrice" DECIMAL(65, 30),
  ADD COLUMN "wholesalePrice" DECIMAL(65, 30),
  ADD COLUMN "additionalCost" DECIMAL(65, 30);
