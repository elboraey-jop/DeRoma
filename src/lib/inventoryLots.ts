import { Prisma } from "@prisma/client";

export async function consumeInventoryLots(tx: Prisma.TransactionClient, variantId: string, quantity: number) {
  let remainingToConsume = quantity;
  const lots = await tx.inventoryLot.findMany({ where: { variantId, remaining: { gt: 0 } }, orderBy: { receivedAt: "asc" } });
  for (const lot of lots) {
    if (remainingToConsume <= 0) break;
    const consumed = Math.min(lot.remaining, remainingToConsume);
    await tx.inventoryLot.update({ where: { id: lot.id }, data: { remaining: { decrement: consumed } } });
    remainingToConsume -= consumed;
  }
  const nextLot = await tx.inventoryLot.findFirst({ where: { variantId, remaining: { gt: 0 } }, orderBy: { receivedAt: "asc" } });
  if (nextLot) {
    const variant = await tx.productVariant.findUnique({ where: { id: variantId }, select: { productId: true } });
    if (variant) await tx.product.update({ where: { id: variant.productId }, data: { price: nextLot.retailPrice, wholesalePrice: nextLot.wholesalePrice } });
  }
}
