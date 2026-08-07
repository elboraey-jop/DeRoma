import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";
import AnalyticsDashboard, {
  AnalyticsOrder,
  AnalyticsProduct,
  AnalyticsCustomer,
  AnalyticsPromotion,
  AnalyticsReview,
} from "./AnalyticsDashboard";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  await requireAdmin();

  let ordersRaw: any[] = [];
  let productsRaw: any[] = [];
  let customersRaw: any[] = [];
  let promotionsRaw: any[] = [];
  let reviewsRaw: any[] = [];

  try {
    ordersRaw = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    productsRaw = await prisma.product.findMany({
      include: {
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    customersRaw = await prisma.customer.findMany({
      orderBy: { createdAt: "desc" },
    });

    promotionsRaw = await prisma.promotion.findMany({
      orderBy: { createdAt: "desc" },
    });

    reviewsRaw = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch analytics data from Prisma:", error);
  }

  // --- Data Serialization for Client Props ---
  const orders: AnalyticsOrder[] = ordersRaw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName || `${o.customerFirstName || ""} ${o.customerLastName || ""}`.trim() || "Customer",
    customerPhone: o.customerPhone,
    governorate: o.governorate || "Cairo",
    city: o.city || "Cairo",
    paymentMethod: o.paymentMethod || "cod",
    totalPrice: Number(o.totalPrice || 0),
    subtotalPrice: Number(o.subtotalPrice || 0),
    discountAmount: Number(o.discountAmount || 0),
    shippingCost: Number(o.shippingCost || 0),
    status: o.status,
    createdAt: o.createdAt.toISOString(),
    items: (o.items || []).map((it: any) => ({
      productId: it.productId,
      productName: it.productName,
      size: it.size,
      color: it.color,
      quantity: Number(it.quantity || 1),
      price: Number(it.price || 0),
      unitCost: Number(it.unitCost || 0),
      category: it.product?.category || "accessories",
    })),
  }));

  const products: AnalyticsProduct[] = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price || 0),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    category: p.category,
    status: p.status,
    rating: Number(p.rating || 0),
    reviewsCount: Number(p.reviewsCount || 0),
    createdAt: p.createdAt.toISOString(),
    variants: (p.variants || []).map((v: any) => ({
      id: v.id,
      stock: Number(v.stock || 0),
      size: v.size,
    })),
  }));

  const customers: AnalyticsCustomer[] = customersRaw.map((c) => ({
    id: c.id,
    name: c.name || `${c.firstName || ""} ${c.lastName || ""}`.trim() || "Customer",
    phone: c.phone,
    governorate: c.governorate,
    createdAt: c.createdAt.toISOString(),
  }));

  const promotions: AnalyticsPromotion[] = promotionsRaw.map((pr) => ({
    id: pr.id,
    code: pr.code,
    name: pr.name,
    type: pr.type,
    value: Number(pr.value || 0),
    usedCount: Number(pr.usedCount || 0),
    active: pr.active,
  }));

  const reviews: AnalyticsReview[] = reviewsRaw.map((r) => ({
    id: r.id,
    productId: r.productId,
    rating: Number(r.rating || 0),
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  }));

  return (
    <AnalyticsDashboard
      orders={orders}
      products={products}
      customers={customers}
      promotions={promotions}
      reviews={reviews}
    />
  );
}
