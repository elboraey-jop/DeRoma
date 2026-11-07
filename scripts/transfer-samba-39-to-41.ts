import dotenv from "dotenv";
dotenv.config();

import { Prisma } from "@prisma/client";
import prisma from "../src/lib/prisma";

// Edit these values to transfer stock on a different product/size.
const PRODUCT_NAME = "Adidas Samba - Beige-Burgundy";
const FROM_SIZE = "39";
const TO_SIZE = "41";
const QUANTITY = 1; // pieces to move from FROM_SIZE to TO_SIZE

type Tx = Prisma.TransactionClient;

async function nextAuditNumber(tx: Tx): Promise<string> {
  const audits = await tx.stockAudit.findMany({ select: { auditNumber: true } });
  const maxNumber = audits.reduce((acc, audit) => {
    const match = audit.auditNumber.match(/(\d+)$/);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `AUD-${String(maxNumber + 1).padStart(4, "0")}`;
}

function toVariantRow(
  size: string,
  currentStock: number,
  nextStock: number,
  unitPrice: number,
) {
  return {
    size,
    currentStock,
    nextStock,
    unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
  };
}

async function transferStock() {
  const execute = process.argv.includes("--execute");

  try {
    if ((FROM_SIZE as string) === (TO_SIZE as string)) {
      throw new Error("FROM_SIZE and TO_SIZE must be different.");
    }
    if (QUANTITY <= 0) {
      throw new Error("QUANTITY must be greater than zero.");
    }

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

    const pickVariant = (size: string) => {
      const variants = product.variants.filter((variant) => variant.size === size);
      if (variants.length === 0) {
        throw new Error(`Size ${size} is missing from product: ${PRODUCT_NAME}`);
      }
      if (variants.length > 1) {
        throw new Error(
          `Found ${variants.length} variants with size ${size} on "${PRODUCT_NAME}". Fix this duplication manually.`,
        );
      }
      return variants[0];
    };

    const fromVariant = pickVariant(FROM_SIZE);
    const toVariant = pickVariant(TO_SIZE);

    if (fromVariant.stock < QUANTITY) {
      throw new Error(
        `Size ${FROM_SIZE} only has ${fromVariant.stock} piece(s), not enough to move ${QUANTITY}.`,
      );
    }

    const fallbackPrice = (variant: typeof fromVariant) =>
      Number(
        variant.wholesalePrice ?? product.wholesalePrice ?? variant.price ?? product.price,
      );

    const fromRow = toVariantRow(
      FROM_SIZE,
      fromVariant.stock,
      fromVariant.stock - QUANTITY,
      fallbackPrice(fromVariant),
    );
    const toRow = toVariantRow(
      TO_SIZE,
      toVariant.stock,
      toVariant.stock + QUANTITY,
      fallbackPrice(toVariant),
    );

    console.log("Stock transfer preview");
    console.log(`- ${product.name} | ${FROM_SIZE}: ${fromRow.currentStock} → ${fromRow.nextStock} (-${QUANTITY})`);
    console.log(`- ${product.name} | ${TO_SIZE}: ${toRow.currentStock} → ${toRow.nextStock} (+${QUANTITY})`);

    if (!execute) {
      console.log("\nNo changes made. Run with --execute to apply this transfer.");
      return;
    }

    const variantIds = [fromVariant, toVariant].map((variant) => variant.id);
    if (new Set(variantIds).size !== variantIds.length) {
      throw new Error("Source and target variants must be different.");
    }

    const rows = [fromRow, toRow];
    const auditNumber = await prisma.$transaction(async (tx) => {
      const audit = await tx.stockAudit.create({
        data: {
          auditNumber: await nextAuditNumber(tx),
          title: "Stock transfer",
          notes: `Moved ${QUANTITY} piece(s) from size ${FROM_SIZE} to size ${TO_SIZE} with the transfer script.`,
          status: "completed",
          auditedBy: "Admin",
          totalExpected: rows.reduce((sum, row) => sum + row.currentStock, 0),
          totalActual: rows.reduce((sum, row) => sum + row.nextStock, 0),
          totalDiscrepancy: rows.reduce(
            (sum, row) => sum + Math.abs(row.nextStock - row.currentStock),
            0,
          ),
          discrepancyValue: rows.reduce(
            (sum, row) => sum + (row.nextStock - row.currentStock) * row.unitPrice,
            0,
          ),
          items: {
            create: rows.map((row) => ({
              variantId: row.size === FROM_SIZE ? fromVariant.id : toVariant.id,
              productName: product.name,
              sku: product.sku || "",
              size: row.size,
              color: product.color || "",
              expectedStock: row.currentStock,
              actualStock: row.nextStock,
              discrepancy: row.nextStock - row.currentStock,
              unitPrice: row.unitPrice,
              notes: `Transfer ${FROM_SIZE} → ${TO_SIZE}.`,
            })),
          },
        },
      });

      for (const [variant, row] of [
        [fromVariant, fromRow],
        [toVariant, toRow],
      ] as const) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { stock: row.nextStock },
        });
      }

      return audit.auditNumber;
    }, { maxWait: 20000, timeout: 60000 });

    console.log("\nChanges applied successfully");
    console.log(`- ${product.name} | ${FROM_SIZE}: ${fromRow.currentStock} → ${fromRow.nextStock}`);
    console.log(`- ${product.name} | ${TO_SIZE}: ${toRow.currentStock} → ${toRow.nextStock}`);
    console.log(`- Audit: ${auditNumber}`);
  } catch (error) {
    console.error("Transfer failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

transferStock();
