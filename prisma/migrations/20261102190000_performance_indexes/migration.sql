-- Indexes for the public catalog, order tracking, inventory joins, and admin reports.
-- All indexes are additive and safe for the current data model.
CREATE INDEX IF NOT EXISTS "Product_status_createdAt_idx"
  ON "Product"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "Product_category_status_createdAt_idx"
  ON "Product"("category", "status", "createdAt");

CREATE INDEX IF NOT EXISTS "ProductRelation_relatedProductId_idx"
  ON "ProductRelation"("relatedProductId");

CREATE INDEX IF NOT EXISTS "ProductVariant_productId_stock_idx"
  ON "ProductVariant"("productId", "stock");

CREATE INDEX IF NOT EXISTS "Order_createdAt_idx"
  ON "Order"("createdAt");

CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx"
  ON "Order"("status", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_customerPhone_createdAt_idx"
  ON "Order"("customerPhone", "createdAt");

CREATE INDEX IF NOT EXISTS "Order_userId_createdAt_idx"
  ON "Order"("userId", "createdAt");

CREATE INDEX IF NOT EXISTS "OrderItem_productId_idx"
  ON "OrderItem"("productId");

CREATE INDEX IF NOT EXISTS "OrderItem_variantId_idx"
  ON "OrderItem"("variantId");

CREATE INDEX IF NOT EXISTS "Review_status_showOnHome_createdAt_idx"
  ON "Review"("status", "showOnHome", "createdAt");
