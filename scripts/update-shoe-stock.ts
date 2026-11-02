import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma";

type TargetStock = Record<string, number>;

const TARGETS: Array<{ productName: string; stock: TargetStock }> = [
  {
    productName: "Adidas Campus - Beige",
    stock: { "36": 0, "37": 0, "38": 3, "39": 1, "40": 1, "41": 1 },
  },
  {
    productName: "Adidas Campus - Grey",
    stock: { "36": 0, "37": 0, "38": 2, "39": 0, "40": 0, "41": 1 },
  },
  {
    productName: "New Balance 530 - White-Navy",
    stock: { "36": 0, "37": 4, "38": 0, "39": 1, "40": 2, "41": 1 },
  },
  {
    productName: "Adidas Forum - Beige",
    stock: { "36": 0, "37": 1, "38": 0, "39": 0, "40": 1, "41": 2 },
  },
];

const SIZES = ["36", "37", "38", "39", "40", "41"];

async function updateShoeStock() {
  const execute = process.argv.includes("--execute");

  try {
    const productNames = TARGETS.map((target) => target.productName);
    const products = await prisma.product.findMany({
      where: { name: { in: productNames } },
      select: {
        id: true,
        name: true,
        sku: true,
        color: true,
        price: true,
        wholesalePrice: true,
        variants: {
          select: {
            id: true,
            size: true,
            stock: true,
            wholesalePrice: true,
            price: true,
          },
        },
      },
    });

    const productsByName = new Map(products.map((product) => [product.name, product]));
    const changes: Array<{
      productId: string;
      productName: string;
      sku: string;
      color: string;
      variantId: string;
      size: string;
      expectedStock: number;
      actualStock: number;
      unitPrice: number;
    }> = [];

    for (const target of TARGETS) {
      const product = productsByName.get(target.productName);
      if (!product) {
        throw new Error(`Product not found: ${target.productName}`);
      }

      const variantsBySize = new Map(product.variants.map((variant) => [variant.size, variant]));
      for (const size of SIZES) {
        const variant = variantsBySize.get(size);
        if (!variant) {
          throw new Error(`Size ${size} is missing from product: ${target.productName}`);
        }

        const actualStock = target.stock[size];
        const unitPrice = Number(
          variant.wholesalePrice ?? product.wholesalePrice ?? variant.price ?? product.price,
        );

        changes.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku || "",
          color: product.color || "",
          variantId: variant.id,
          size,
          expectedStock: variant.stock,
          actualStock,
          unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
        });
      }
    }

    console.log("Shoe stock update preview");
    for (const change of changes) {
      const marker = change.expectedStock === change.actualStock ? "=" : "→";
      console.log(
        `- ${change.productName} | ${change.size}: ${change.expectedStock} ${marker} ${change.actualStock}`,
      );
    }

    const changedItems = changes.filter(
      (change) => change.expectedStock !== change.actualStock,
    );
    console.log(`\n- Variants checked: ${changes.length}`);
    console.log(`- Variants changed: ${changedItems.length}`);

    if (!execute) {
      console.log("\nNo changes made. Run with --execute to apply this stock update.");
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const auditCount = await tx.stockAudit.count();
      const auditNumber = `AUD-${String(auditCount + 1).padStart(4, "0")}`;
      const totalExpected = changedItems.reduce((sum, item) => sum + item.expectedStock, 0);
      const totalActual = changedItems.reduce((sum, item) => sum + item.actualStock, 0);
      const totalDiscrepancy = changedItems.reduce(
        (sum, item) => sum + Math.abs(item.actualStock - item.expectedStock),
        0,
      );
      const discrepancyValue = changedItems.reduce(
        (sum, item) => sum + (item.actualStock - item.expectedStock) * item.unitPrice,
        0,
      );

      const audit = await tx.stockAudit.create({
        data: {
          auditNumber,
          title: "Inventory update from stock count",
          notes: "Updated from the four-shoe stock count message.",
          status: "completed",
          auditedBy: "Admin",
          totalExpected,
          totalActual,
          totalDiscrepancy,
          discrepancyValue,
          items: {
            create: changedItems.map((item) => ({
              variantId: item.variantId,
              productName: item.productName,
              sku: item.sku,
              size: item.size,
              color: item.color,
              expectedStock: item.expectedStock,
              actualStock: item.actualStock,
              discrepancy: item.actualStock - item.expectedStock,
              unitPrice: item.unitPrice,
              notes: "Updated from stock count message.",
            })),
          },
        },
      });

      for (const item of changedItems) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: item.actualStock },
        });
      }

      return { auditNumber: audit.auditNumber, changedItems: changedItems.length };
    }, { maxWait: 20000, timeout: 60000 });

    console.log("\nChanges applied successfully");
    console.log(`- Audit: ${result.auditNumber}`);
    console.log(`- Variants updated: ${result.changedItems}`);
  } catch (error) {
    console.error("Shoe stock update failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

updateShoeStock();
