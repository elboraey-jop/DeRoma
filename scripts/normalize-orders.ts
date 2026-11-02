import dotenv from "dotenv";
dotenv.config();

import prisma from "../src/lib/prisma";

const CANCELLED_STATUSES = ["cancelled", "canceled"];
const ACTIVE_STATUSES = [...CANCELLED_STATUSES, "delivered"];

async function normalizeOrders() {
  const execute = process.argv.includes("--execute");

  try {
    const [totalOrders, cancelledOrders, ordersToDeliver] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({
        where: { status: { in: CANCELLED_STATUSES } },
      }),
      prisma.order.count({
        where: { status: { notIn: ACTIVE_STATUSES } },
      }),
    ]);

    console.log("Order normalization preview");
    console.log(`- Total orders: ${totalOrders}`);
    console.log(`- Orders to mark as delivered: ${ordersToDeliver}`);
    console.log(`- Cancelled orders to delete: ${cancelledOrders}`);

    if (!execute) {
      console.log("\nNo changes made. Run with --execute to apply these changes.");
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const cancelled = await tx.order.findMany({
        where: { status: { in: CANCELLED_STATUSES } },
        select: { id: true },
      });
      const cancelledIds = cancelled.map((order) => order.id);

      const delivered = await tx.order.updateMany({
        where: { status: { notIn: ACTIVE_STATUSES } },
        data: { status: "delivered" },
      });

      let deletedItems = 0;
      if (cancelledIds.length > 0) {
        const deletedOrderItems = await tx.orderItem.deleteMany({
          where: { orderId: { in: cancelledIds } },
        });
        deletedItems = deletedOrderItems.count;
      }

      const deletedOrders = await tx.order.deleteMany({
        where: { id: { in: cancelledIds } },
      });

      return {
        delivered: delivered.count,
        deletedOrders: deletedOrders.count,
        deletedItems,
      };
    });

    console.log("\nChanges applied successfully");
    console.log(`- Marked as delivered: ${result.delivered}`);
    console.log(`- Deleted cancelled orders: ${result.deletedOrders}`);
    console.log(`- Deleted related order items: ${result.deletedItems}`);
  } catch (error) {
    console.error("Order normalization failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

normalizeOrders();
