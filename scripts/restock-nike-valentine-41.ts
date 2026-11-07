import dotenv from "dotenv";
dotenv.config();

import { Prisma } from "@prisma/client";
import prisma from "../src/lib/prisma";

// Edit these values to restock a different product/size.
const PRODUCT_NAME = "Nike Air Force Valentine - Pink";
const SIZE = "41";
const QUANTITY = 1; // pieces to add

type Tx = Prisma.TransactionClient;

async function nextAuditNumber(tx: Tx): Promise<string> {
  const audits = await tx.stockAudit.findMany({ select: { auditNumber: true } });
  const maxNumber = audits.reduce((acc, audit) => {
    const match = audit.auditNumber.match(/(\d+)$/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `AUD-${String(maxNumber + 1).padStart(4, "0")}`;
}

async function restockProduct() {
  const execute = process.argv.includes("--execute");

  try {
    const products = await prisma.product.findMany({
      where: { name: PRODUCT_NAME },
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

    if (products.length === 0) {
      throw new Error(`Product not found: ${PRODUCT_NAME}`);
    }
    if (products.length > 1) {
      throw new Error(
        `Found ${products.length} products named "${PRODUCT_NAME}". Edit this script to be more specific.`,
      );
    }
    const product = products[0];

    const variants = product.variants.filter((variant) => variant.size === SIZE);
    if (variants.length === 0) {
      throw new Error(`Size ${SIZE} is missing from product: ${PRODUCT_NAME}`);
    }
    if (variants.length > 1) {
      throw new Error(
        `Found ${variants.length} variants with size ${SIZE} on "${PRODUCT_NAME}". Fix this duplication manually.`,
      );
    }
    const variant = variants[0];

    const actualStock = variant.stock + QUANTITY;
    const unitPrice = Number(
      variant.wholesalePrice ?? product.wholesalePrice ?? variant.price ?? product.price,
    );

    console.log("Restock preview");
    console.log(
      `- ${product.name} | ${SIZE}: ${variant.stock} → ${actualStock} (+${QUANTITY})`,
    );

    if (!execute) {
      console.log("\nNo changes made. Run with --execute to apply this restock.");
      return;
    }

    const auditNumber = await prisma.$transaction(async (tx) => {
      const audit = await tx.stockAudit.create({
        data: {
          auditNumber: await nextAuditNumber(tx),
          title: "Manual restock",
          notes: `Added ${QUANTITY} piece(s) to size ${SIZE} from the restock script.`,
          status: "completed",
          auditedBy: "Admin",
          totalExpected: variant.stock,
          totalActual: actualStock,
          totalDiscrepancy: Math.abs(actualStock - variant.stock),
          discrepancyValue: QUANTITY * unitPrice,
          items: {
            create: {
              variantId: variant.id,
              productName: product.name,
              sku: product.sku || "",
              size: SIZE,
              color: product.color || "",
              expectedStock: variant.stock,
              actualStock: actualStock,
              discrepancy: actualStock - variant.stock,
              unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
              notes: `Added ${QUANTITY} piece(s) from the restock script.`,
            },
          },
        },
      });

      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: actualStock },
      });

      return audit.auditNumber;
    }, { maxWait: 20000, timeout: 60000 });

    console.log("\nChanges applied successfully");
    console.log(`- ${product.name} | ${SIZE}: ${variant.stock} → ${actualStock}`);
    console.log(`- Audit: ${auditNumber}`);
  } catch (error) {
    console.error("Restock failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

restockProduct();
