import prisma from "@/lib/prisma";
import { ProductWithVariants } from "@/components/ProductCard";

export const FALLBACK_PRODUCTS: ProductWithVariants[] = [
  {
    id: "fallback-1",
    name: "سنيكرز كلاسيك مريح حريمي",
    description: "سنيكرز نسائي مريح جداً مناسب للمشاوير اليومية والعمل، بتصميم كلاسيكي خفيف وعصري وألوان هادئة.",
    price: 1200,
    compareAtPrice: 1500,
    category: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v1-37-w", productId: "fallback-1", size: "37", color: "أبيض", stock: 10, sku: "DR-01-WH-37" },
      { id: "v1-38-w", productId: "fallback-1", size: "38", color: "أبيض", stock: 12, sku: "DR-01-WH-38" },
      { id: "v1-39-w", productId: "fallback-1", size: "39", color: "أبيض", stock: 8, sku: "DR-01-WH-39" },
      { id: "v1-40-w", productId: "fallback-1", size: "40", color: "أبيض", stock: 4, sku: "DR-01-WH-40" },
      { id: "v1-38-b", productId: "fallback-1", size: "38", color: "بيج", stock: 6, sku: "DR-01-BG-38" },
      { id: "v1-39-b", productId: "fallback-1", size: "39", color: "بيج", stock: 5, sku: "DR-01-BG-39" },
    ]
  },
  {
    id: "fallback-2",
    name: "سنيكرز جيب اسبورت للجري",
    description: "حذاء رياضي حريمي للجري والتمارين في الجيم، مزود بنعل مبطن لامتصاص الصدمات وتهوية ممتازة لممارسة الرياضة براحة.",
    price: 1800,
    compareAtPrice: 2200,
    category: "running",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v2-37-k", productId: "fallback-2", size: "37", color: "أسود", stock: 6, sku: "DR-02-BK-37" },
      { id: "v2-38-k", productId: "fallback-2", size: "38", color: "أسود", stock: 10, sku: "DR-02-BK-38" },
      { id: "v2-39-k", productId: "fallback-2", size: "39", color: "أسود", stock: 8, sku: "DR-02-BK-39" },
      { id: "v2-40-k", productId: "fallback-2", size: "40", color: "أسود", stock: 4, sku: "DR-02-BK-40" },
      { id: "v2-38-r", productId: "fallback-2", size: "38", color: "أحمر", stock: 5, sku: "DR-02-RD-38" },
    ]
  },
  {
    id: "fallback-3",
    name: "سنيكرز ريترو ستايل كلاسيك",
    description: "حذاء رياضي نسائي مستوحى من التصاميم الكلاسيكية القديمة بنعل مسطح مريح يناسب الإطلالات اليومية الكاجوال.",
    price: 1450,
    compareAtPrice: 1650,
    category: "retro",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v3-37-g", productId: "fallback-3", size: "37", color: "أبيض", stock: 8, sku: "DR-03-WT-37" },
      { id: "v3-38-g", productId: "fallback-3", size: "38", color: "أبيض", stock: 14, sku: "DR-03-WT-38" },
      { id: "v3-39-g", productId: "fallback-3", size: "39", color: "أبيض", stock: 10, sku: "DR-03-WT-39" },
      { id: "v3-38-bg", productId: "fallback-3", size: "38", color: "بيج", stock: 7, sku: "DR-03-BG-38" },
    ]
  },
  {
    id: "fallback-4",
    name: "سنيكرز بلاتفورم نعل مرتفع",
    description: "حذاء سنيكرز حريمي بنعل سميك ومرتفع يجمع بين الأناقة العصرية والراحة الفائقة طوال اليوم، ألوان متناسقة تناسب جميع ملابسك.",
    price: 1600,
    compareAtPrice: 1900,
    category: "chunky",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v4-37-k", productId: "fallback-4", size: "37", color: "أسود", stock: 10, sku: "DR-04-BK-37" },
      { id: "v4-38-k", productId: "fallback-4", size: "38", color: "أسود", stock: 12, sku: "DR-04-BK-38" },
      { id: "v4-39-k", productId: "fallback-4", size: "39", color: "أسود", stock: 9, sku: "DR-04-BK-39" },
      { id: "v4-40-k", productId: "fallback-4", size: "40", color: "أسود", stock: 5, sku: "DR-04-BK-40" },
    ]
  },
  {
    id: "fallback-5",
    name: "سنيكرز أديداس كاجوال خفيف",
    description: "حذاء رياضي كاجوال خفيف الوزن مصنوع من خامات عالية الجودة لراحة قصوى أثناء المشي والوقوف الطويل، تصميم كلاسيكي جذاب.",
    price: 1350,
    compareAtPrice: null,
    category: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v5-38-k", productId: "fallback-5", size: "38", color: "أسود", stock: 8, sku: "DR-05-BK-38" },
      { id: "v5-39-k", productId: "fallback-5", size: "39", color: "أسود", stock: 10, sku: "DR-05-BK-39" },
      { id: "v5-40-k", productId: "fallback-5", size: "40", color: "أسود", stock: 4, sku: "DR-05-BK-40" },
      { id: "v5-38-br", productId: "fallback-5", size: "38", color: "بني", stock: 6, sku: "DR-05-BR-38" },
    ]
  }
];

export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts && dbProducts.length > 0) {
      return dbProducts.map((p) => ({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        variants: p.variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
        })),
      })) as any;
    }
  } catch (error) {
    console.warn("Database connection issue. Using fallback products dataset:", error);
  }

  return FALLBACK_PRODUCTS;
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (product) {
      return {
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        variants: product.variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
        })),
      } as any;
    }
  } catch (error) {
    console.warn("Database error during getProductById:", error);
  }

  return FALLBACK_PRODUCTS.find((p) => p.id === id) || FALLBACK_PRODUCTS[0];
}
