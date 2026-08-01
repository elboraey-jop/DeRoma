import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { CATALOG_PRODUCT_IDS, CATALOG_PRODUCTS } from "../src/lib/productCatalog";

const prisma = new PrismaClient();

function buildVariants(product: (typeof CATALOG_PRODUCTS)[number]) {
  const sizes = product.category === "shoes" ? ["36", "37", "38", "39", "40", "41"] : product.sizes;
  return sizes.map((size, index) => ({
    id: `${product.id}-${size}`,
    productId: product.id,
    size,
    stock: (index % 3 === 0) ? 0 : Math.max(product.stock - (index % 2), 1),
  }));
}

const SUPPLIERS = [
  { id: "supplier-nile-footwear", name: "Nile Footwear Trading", phone: "01001234567", email: "orders@nilefootwear.eg", address: "Nasr City, Cairo", notes: "Primary New Balance and Nike supplier." },
  { id: "supplier-cairo-sneaker", name: "Cairo Sneaker House", phone: "01007654321", email: "hello@cairosneaker.eg", address: "Heliopolis, Cairo", notes: "Adidas lifestyle and terrace styles." },
  { id: "supplier-delta-sport", name: "Delta Sport Distribution", phone: "01123456789", email: "sales@deltasport.eg", address: "Mansoura, Dakahlia", notes: "Running and performance footwear." },
  { id: "supplier-boutique-pack", name: "Boutique Pack & Care", phone: "01234567890", email: "care@boutiquepack.eg", address: "6th of October, Giza", notes: "Boxes, tissue paper, and care cards." },
];

const CATALOG_OPTIONS = [
  ...["New Balance", "Adidas", "Nike", "ASICS"].map((name, sortOrder) => ({ category: "shoes", type: "brand", name, sortOrder })),
  ...["White", "Beige", "Black", "Grey", "Pink", "Brown", "Burgundy", "Navy", "Silver"].map((name, sortOrder) => ({ category: "shoes", type: "color", name, sortOrder })),
  ...["36", "37", "38", "39", "40", "41"].map((name, sortOrder) => ({ category: "shoes", type: "size", name, sortOrder })),
  ...["Mesh", "Suede", "Leather", "Synthetic leather", "Nylon"].map((name, sortOrder) => ({ category: "shoes", type: "material", name, sortOrder })),
];

const SHIPPING_ZONES = [
  { id: "zone-cairo-giza", name: "Cairo & Giza", governorates: ["Cairo", "Giza"], fee: 60, estimatedDays: "1–2 business days", freeShippingThreshold: 2500 },
  { id: "zone-delta", name: "Delta & Alexandria", governorates: ["Alexandria", "Beheira", "Dakahlia", "Gharbia", "Kafr El Sheikh", "Monufia", "Qalyubia", "Sharqia"], fee: 85, estimatedDays: "2–4 business days", freeShippingThreshold: 3000 },
  { id: "zone-upper-egypt", name: "Upper Egypt & Canal", governorates: ["Aswan", "Assiut", "Beni Suef", "Fayoum", "Luxor", "Minya", "Qena", "Sohag", "Ismailia", "Port Said", "Suez"], fee: 110, estimatedDays: "3–5 business days", freeShippingThreshold: 3500 },
];

const PROMOTIONS = [
  { id: "promo-welcome-10", code: "WELCOME10", name: "Welcome to DeRoma", type: "percentage", value: 10, scope: "order", targetValue: null, minimumOrderValue: 1200, usageLimit: 100, endsAt: new Date("2026-12-31T23:59:59.000Z") },
  { id: "promo-shoes-250", code: "SHOES250", name: "Shoes edit savings", type: "fixed", value: 250, scope: "category", targetValue: "shoes", minimumOrderValue: 2000, usageLimit: 60, endsAt: new Date("2026-10-31T23:59:59.000Z") },
  { id: "promo-freeship", code: "FREESHIP", name: "Free delivery weekend", type: "free_shipping", value: 0, scope: "order", targetValue: null, minimumOrderValue: 2500, usageLimit: 40, endsAt: new Date("2026-09-30T23:59:59.000Z") },
];

const ANNOUNCEMENTS = [
  { id: "announcement-welcome", text: "Complimentary delivery on orders over 2,500 EGP · Shop the new DeRoma edit", backgroundColor: "#942E3A", textColor: "#FFF9EB", moving: true },
  { id: "announcement-fitting", text: "Order with confidence — open and try your shoes before payment", backgroundColor: "#D8B46A", textColor: "#942E3A", moving: false },
];

const DEMO_ORDERS = [
  { orderNumber: "DR-DEMO-1001", customerName: "Mariam Hassan", customerPhone: "01011112222", governorate: "Cairo", city: "New Cairo", address: "Street 90, Fifth Settlement", status: "pending", shippingCost: 60, discountAmount: 0, daysAgo: 0, productIndexes: [0, 5] },
  { orderNumber: "DR-DEMO-1002", customerName: "Nour Adel", customerPhone: "01033334444", governorate: "Giza", city: "Dokki", address: "12 Tahrir Street, Dokki", status: "shipped", shippingCost: 60, discountAmount: 250, daysAgo: 3, productIndexes: [3] },
  { orderNumber: "DR-DEMO-1003", customerName: "Salma Youssef", customerPhone: "01155556666", governorate: "Alexandria", city: "Smouha", address: "45 Victor Emanuel Street", status: "delivered", shippingCost: 85, discountAmount: 0, daysAgo: 8, productIndexes: [8, 10] },
  { orderNumber: "DR-DEMO-1004", customerName: "Hana Mahmoud", customerPhone: "01277778888", governorate: "Qalyubia", city: "Banha", address: "El Geish Street, Banha", status: "delivered", shippingCost: 85, discountAmount: 150, daysAgo: 14, productIndexes: [1] },
  { orderNumber: "DR-DEMO-1005", customerName: "Farida Samir", customerPhone: "01099990000", governorate: "Giza", city: "Sheikh Zayed", address: "Beverly Hills, Sheikh Zayed", status: "cancelled", shippingCost: 60, discountAmount: 0, daysAgo: 21, productIndexes: [6] },
  { orderNumber: "DR-DEMO-1006", customerName: "Laila Omar", customerPhone: "01122223333", governorate: "Cairo", city: "Heliopolis", address: "Baghdad Street, Korba", status: "delivered", shippingCost: 60, discountAmount: 0, daysAgo: 28, productIndexes: [11, 12] },
];

const REVIEW_LINES = [
  ["Comfortable from the first wear", "The fit is beautiful and the cushioning made a full day of walking easy."],
  ["Exactly like the photos", "The color is elegant, delivery was quick, and the packaging felt very thoughtful."],
  ["My new everyday pair", "Lightweight, easy to style, and the sizing guide was accurate."],
];

async function main() {
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
      create: {
        email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
        passwordHash,
        name: "Store Administrator",
        role: "admin",
      },
      update: {
        passwordHash,
        role: "admin",
        name: "Store Administrator",
      },
    });
  }

  await prisma.product.updateMany({
    where: { id: { notIn: CATALOG_PRODUCT_IDS } },
    data: { status: "draft" },
  });

  for (const supplier of SUPPLIERS) {
    await prisma.supplier.upsert({ where: { id: supplier.id }, create: supplier, update: supplier });
  }

  for (const option of CATALOG_OPTIONS) {
    await prisma.catalogOption.upsert({
      where: { category_type_name: { category: option.category, type: option.type, name: option.name } },
      create: option,
      update: { value: null, sortOrder: option.sortOrder, active: true },
    });
  }

  for (const product of CATALOG_PRODUCTS) {
    const supplierId = product.brand === "Adidas"
      ? "supplier-cairo-sneaker"
      : product.brand === "ASICS"
        ? "supplier-delta-sport"
        : "supplier-nile-footwear";
    const material = product.brand === "ASICS" || product.brand === "Nike" ? "Mesh" : product.brand === "Adidas" ? "Suede" : "Synthetic leather";
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        sku: `DR-${product.id.toUpperCase()}`,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: "active",
        category: product.category,
        subcategory: null,
        brand: product.brand,
        material,
        wholesalePrice: Math.round(product.price * 0.62),
        additionalCost: 85,
        supplierId,
        badge: product.compareAtPrice ? "Sale" : product.rating >= 4.8 ? "Best seller" : "New arrival",
        featured: product.rating >= 4.8,
        bestSeller: product.rating >= 4.7,
        rating: product.rating,
        reviewsCount: 3,
        lowStockLimit: 2,
        images: [product.image],
        color: product.color,
      },
      update: {
        name: product.name,
        sku: `DR-${product.id.toUpperCase()}`,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: "active",
        category: product.category,
        subcategory: null,
        brand: product.brand,
        material,
        wholesalePrice: Math.round(product.price * 0.62),
        additionalCost: 85,
        supplierId,
        badge: product.compareAtPrice ? "Sale" : product.rating >= 4.8 ? "Best seller" : "New arrival",
        featured: product.rating >= 4.8,
        bestSeller: product.rating >= 4.7,
        rating: product.rating,
        reviewsCount: 3,
        lowStockLimit: 2,
        images: [product.image],
        color: product.color,
      },
    });

    for (const variant of buildVariants(product)) {
      await prisma.productVariant.upsert({
        where: { id: variant.id },
        create: variant,
        update: {
          productId: variant.productId,
          size: variant.size,
          stock: variant.stock,
        },
      });
    }
  }

  for (const [index, product] of CATALOG_PRODUCTS.entries()) {
    for (const offset of [1, 2]) {
      const related = CATALOG_PRODUCTS[(index + offset) % CATALOG_PRODUCTS.length];
      await prisma.productRelation.upsert({
        where: { productId_relatedProductId: { productId: product.id, relatedProductId: related.id } },
        create: { productId: product.id, relatedProductId: related.id },
        update: {},
      });
    }
  }

  for (const zone of SHIPPING_ZONES) {
    await prisma.shippingZone.upsert({ where: { id: zone.id }, create: zone, update: zone });
  }

  for (const promotion of PROMOTIONS) {
    await prisma.promotion.upsert({ where: { id: promotion.id }, create: promotion, update: promotion });
  }

  for (const announcement of ANNOUNCEMENTS) {
    await prisma.announcementBar.upsert({ where: { id: announcement.id }, create: announcement, update: { ...announcement, active: true } });
  }

  const variants = await prisma.productVariant.findMany({ where: { productId: { in: CATALOG_PRODUCT_IDS } }, include: { product: true } });
  const variantsByProduct = new Map<string, (typeof variants)[number]>();
  for (const variant of variants) {
    if (!variantsByProduct.has(variant.productId) && variant.stock > 0) variantsByProduct.set(variant.productId, variant);
  }

  for (const product of CATALOG_PRODUCTS) {
    for (let index = 0; index < REVIEW_LINES.length; index += 1) {
      const [title, body] = REVIEW_LINES[index];
      await prisma.review.upsert({
        where: { id: `${product.id}-review-${index + 1}` },
        create: { id: `${product.id}-review-${index + 1}`, productId: product.id, customerName: ["Yasmin Khaled", "Sara Ahmed", "Nour Mohamed"][index], customerPhone: ["01012345678", "01123456780", "01234567890"][index], rating: index === 2 ? 4 : 5, title, body, status: "approved", verifiedPurchase: true },
        update: { customerName: ["Yasmin Khaled", "Sara Ahmed", "Nour Mohamed"][index], rating: index === 2 ? 4 : 5, title, body, status: "approved", verifiedPurchase: true },
      });
    }
  }

  for (const orderSeed of DEMO_ORDERS) {
    const items = orderSeed.productIndexes.map((productIndex) => {
      const product = CATALOG_PRODUCTS[productIndex];
      const variant = variantsByProduct.get(product.id);
      if (!variant) throw new Error(`Missing seeded variant for ${product.id}`);
      return { productId: product.id, variantId: variant.id, productName: product.name, size: variant.size, color: product.color, quantity: 1, price: product.price, unitCost: Math.round(product.price * 0.62) + 85 };
    });
    const subtotalPrice = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    await prisma.order.upsert({
      where: { orderNumber: orderSeed.orderNumber },
      create: { orderNumber: orderSeed.orderNumber, customerName: orderSeed.customerName, customerPhone: orderSeed.customerPhone, governorate: orderSeed.governorate, city: orderSeed.city, address: orderSeed.address, subtotalPrice, discountAmount: orderSeed.discountAmount, totalPrice: subtotalPrice - orderSeed.discountAmount + orderSeed.shippingCost, shippingCost: orderSeed.shippingCost, status: orderSeed.status, manual: true, createdAt: new Date(Date.now() - orderSeed.daysAgo * 86400000), items: { create: items } },
      update: { customerName: orderSeed.customerName, customerPhone: orderSeed.customerPhone, governorate: orderSeed.governorate, city: orderSeed.city, address: orderSeed.address, subtotalPrice, discountAmount: orderSeed.discountAmount, totalPrice: subtotalPrice - orderSeed.discountAmount + orderSeed.shippingCost, shippingCost: orderSeed.shippingCost, status: orderSeed.status, items: { deleteMany: {}, create: items } },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
