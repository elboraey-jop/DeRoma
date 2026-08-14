"use server";

import prisma from "@/lib/prisma";

export type NotificationCategory = "all" | "orders" | "stock" | "messages" | "reviews";
export type NotificationSeverity = "high" | "medium" | "info";

export type NotificationItem = {
  id: string;
  category: "orders" | "stock" | "messages" | "reviews";
  title: string;
  description: string;
  time: string;
  href: string;
  severity: NotificationSeverity;
  rawDate: string;
};

export type NotificationSummary = {
  totalCount: number;
  ordersCount: number;
  stockCount: number;
  messagesCount: number;
  reviewsCount: number;
  items: NotificationItem[];
};

export async function getAdminNotificationsAction(): Promise<NotificationSummary> {
  try {
    const [pendingOrders, outOfStockVariants, lowStockVariants, unreadMessages, pendingReviews] =
      await Promise.all([
        // 1. Pending orders
        prisma.order.findMany({
          where: { status: "pending" },
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            totalPrice: true,
            subtotalPrice: true,
            discountAmount: true,
            shippingCost: true,
            createdAt: true,
          },
        }),
        // 2. Out of stock variants (stock == 0)
        prisma.productVariant.findMany({
          where: { stock: 0 },
          take: 15,
          select: {
            id: true,
            size: true,
            stock: true,
            product: {
              select: {
                id: true,
                name: true,
                color: true,
                images: true,
              },
            },
          },
        }),
        // 3. Low stock variants (each product uses its own low-stock limit)
        prisma.productVariant.findMany({
          where: {
            stock: {
              gt: 0,
            },
          },
          select: {
            id: true,
            size: true,
            stock: true,
            product: {
              select: {
                id: true,
                name: true,
                color: true,
                images: true,
                lowStockLimit: true,
              },
            },
          },
        }).then((variants) =>
          variants
            .filter((variant) => variant.stock <= (variant.product?.lowStockLimit ?? 2))
            .slice(0, 15),
        ),
        // 4. Unread contact messages
        (prisma as any).contactMessage.findMany({
          where: { status: "unread" },
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            phone: true,
            message: true,
            createdAt: true,
          },
        }),
        // 5. Pending reviews needing approval
        prisma.review.findMany({
          where: { status: "pending" },
          take: 15,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            customerName: true,
            rating: true,
            body: true,
            createdAt: true,
            product: {
              select: {
                name: true,
              },
            },
          },
        }),
      ]);

    const items: NotificationItem[] = [];

    // Map Pending Orders
    pendingOrders.forEach((ord) => {
      items.push({
        id: `order-${ord.id}`,
        category: "orders",
        title: `New Pending Order #${ord.orderNumber}`,
        description: `Customer: ${ord.customerName} · Total: ${Number(ord.totalPrice).toLocaleString("en-US")} EGP`,
        time: new Date(ord.createdAt).toISOString(),
        href: "/admin/orders",
        severity: "medium",
        rawDate: ord.createdAt.toISOString(),
      });
    });

    // Map Out of Stock
    outOfStockVariants.forEach((v) => {
      const pName = v.product?.name || "Product";
      const pColor = v.product?.color ? ` (${v.product.color})` : "";
      items.push({
        id: `stock-out-${v.id}`,
        category: "stock",
        title: `Out of Stock: ${pName}${pColor}`,
        description: `Size: ${v.size} · Stock: 0 units remaining`,
        time: new Date().toISOString(),
        href: "/admin/inventory",
        severity: "high",
        rawDate: new Date().toISOString(),
      });
    });

    // Map Low Stock
    lowStockVariants.forEach((v) => {
      const pName = v.product?.name || "Product";
      const pColor = v.product?.color ? ` (${v.product.color})` : "";
      items.push({
        id: `stock-low-${v.id}`,
        category: "stock",
        title: `Low Stock Alert: ${pName}${pColor}`,
        description: `Size: ${v.size} · Only ${v.stock} unit(s) left`,
        time: new Date().toISOString(),
        href: "/admin/inventory",
        severity: "medium",
        rawDate: new Date().toISOString(),
      });
    });

    // Map Unread Messages
    unreadMessages.forEach((m: any) => {
      items.push({
        id: `msg-${m.id}`,
        category: "messages",
        title: `Message from ${m.name}`,
        description: `Phone: ${m.phone} · "${m.message.slice(0, 60)}${m.message.length > 60 ? "..." : ""}"`,
        time: new Date(m.createdAt).toISOString(),
        href: "/admin/messages",
        severity: "medium",
        rawDate: m.createdAt.toISOString(),
      });
    });

    // Map Pending Reviews
    pendingReviews.forEach((r) => {
      items.push({
        id: `review-${r.id}`,
        category: "reviews",
        title: `New Review for ${r.product?.name || "Product"}`,
        description: `By: ${r.customerName} (${r.rating} ★) · "${r.body.slice(0, 50)}${r.body.length > 50 ? "..." : ""}"`,
        time: new Date(r.createdAt).toISOString(),
        href: "/admin/reviews",
        severity: "info",
        rawDate: r.createdAt.toISOString(),
      });
    });

    // Sort items by rawDate desc
    items.sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

    const stockCount = outOfStockVariants.length + lowStockVariants.length;

    return {
      totalCount: items.length,
      ordersCount: pendingOrders.length,
      stockCount,
      messagesCount: unreadMessages.length,
      reviewsCount: pendingReviews.length,
      items,
    };
  } catch (error) {
    console.error("Failed to load notifications:", error);
    return {
      totalCount: 0,
      ordersCount: 0,
      stockCount: 0,
      messagesCount: 0,
      reviewsCount: 0,
      items: [],
    };
  }
}
