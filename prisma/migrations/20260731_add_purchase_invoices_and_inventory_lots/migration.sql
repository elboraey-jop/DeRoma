CREATE TABLE "PurchaseInvoice" (
  "id" TEXT NOT NULL,
  "invoiceNumber" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "invoiceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueDate" TIMESTAMP(3),
  "reference" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'received',
  "subtotal" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "shippingCost" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "discount" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "total" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "amountPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PurchaseInvoice_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PurchaseInvoiceItem" (
  "id" TEXT NOT NULL,
  "invoiceId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "wholesalePrice" DECIMAL(65,30) NOT NULL,
  "retailPrice" DECIMAL(65,30) NOT NULL,
  "lineTotal" DECIMAL(65,30) NOT NULL,
  "notes" TEXT,
  CONSTRAINT "PurchaseInvoiceItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "InventoryLot" (
  "id" TEXT NOT NULL,
  "variantId" TEXT NOT NULL,
  "invoiceItemId" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "remaining" INTEGER NOT NULL,
  "wholesalePrice" DECIMAL(65,30) NOT NULL,
  "retailPrice" DECIMAL(65,30) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InventoryLot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PurchaseInvoice_invoiceNumber_key" ON "PurchaseInvoice"("invoiceNumber");
CREATE INDEX "PurchaseInvoice_supplierId_invoiceDate_idx" ON "PurchaseInvoice"("supplierId", "invoiceDate");
CREATE UNIQUE INDEX "InventoryLot_invoiceItemId_key" ON "InventoryLot"("invoiceItemId");
CREATE INDEX "InventoryLot_variantId_receivedAt_idx" ON "InventoryLot"("variantId", "receivedAt");

ALTER TABLE "PurchaseInvoice" ADD CONSTRAINT "PurchaseInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "PurchaseInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PurchaseInvoiceItem" ADD CONSTRAINT "PurchaseInvoiceItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "InventoryLot" ADD CONSTRAINT "InventoryLot_invoiceItemId_fkey" FOREIGN KEY ("invoiceItemId") REFERENCES "PurchaseInvoiceItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
