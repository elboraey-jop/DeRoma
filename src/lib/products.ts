import prisma from "@/lib/prisma";
import { ProductWithVariants } from "@/components/ProductCard";

export const FALLBACK_PRODUCTS: ProductWithVariants[] = [
  {
    id: "fallback-1",
    name: "Women's Classic Comfortable Sneakers",
    description: "Highly comfortable women's sneakers perfect for daily commuting and work, featuring a classic, lightweight, modern design and calming colors.",
    price: 1200,
    compareAtPrice: 1500,
    category: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v1-37-w", productId: "fallback-1", size: "37", color: "White", stock: 10, sku: "DR-01-WH-37" },
      { id: "v1-38-w", productId: "fallback-1", size: "38", color: "White", stock: 12, sku: "DR-01-WH-38" },
      { id: "v1-39-w", productId: "fallback-1", size: "39", color: "White", stock: 8, sku: "DR-01-WH-39" },
      { id: "v1-40-w", productId: "fallback-1", size: "40", color: "White", stock: 4, sku: "DR-01-WH-40" },
      { id: "v1-38-b", productId: "fallback-1", size: "38", color: "Beige", stock: 6, sku: "DR-01-BG-38" },
      { id: "v1-39-b", productId: "fallback-1", size: "39", color: "Beige", stock: 5, sku: "DR-01-BG-39" },
    ]
  },
  {
    id: "fallback-2",
    name: "Sport Active Running Sneakers",
    description: "Women's athletic shoes for running and gym workouts, equipped with a cushioned sole for shock absorption and excellent ventilation to exercise comfortably.",
    price: 1800,
    compareAtPrice: 2200,
    category: "running",
    images: [
      "https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v2-37-k", productId: "fallback-2", size: "37", color: "Black", stock: 6, sku: "DR-02-BK-37" },
      { id: "v2-38-k", productId: "fallback-2", size: "38", color: "Black", stock: 10, sku: "DR-02-BK-38" },
      { id: "v2-39-k", productId: "fallback-2", size: "39", color: "Black", stock: 8, sku: "DR-02-BK-39" },
      { id: "v2-40-k", productId: "fallback-2", size: "40", color: "Black", stock: 4, sku: "DR-02-BK-40" },
      { id: "v2-38-r", productId: "fallback-2", size: "38", color: "Red", stock: 5, sku: "DR-02-RD-38" },
    ]
  },
  {
    id: "fallback-3",
    name: "Retro Classic Style Sneakers",
    description: "Women's athletic shoes inspired by classic heritage designs with a comfortable flat sole, perfect for daily casual outfits.",
    price: 1450,
    compareAtPrice: 1650,
    category: "retro",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v3-37-g", productId: "fallback-3", size: "37", color: "White", stock: 8, sku: "DR-03-WT-37" },
      { id: "v3-38-g", productId: "fallback-3", size: "38", color: "White", stock: 14, sku: "DR-03-WT-38" },
      { id: "v3-39-g", productId: "fallback-3", size: "39", color: "White", stock: 10, sku: "DR-03-WT-39" },
      { id: "v3-38-bg", productId: "fallback-3", size: "38", color: "Beige", stock: 7, sku: "DR-03-BG-38" },
    ]
  },
  {
    id: "fallback-4",
    name: "Elevated Platform Chunky Sneakers",
    description: "Women's sneakers with a thick platform sole combining modern elegance and superior comfort all day long, featuring matching colors that suit all your outfits.",
    price: 1600,
    compareAtPrice: 1900,
    category: "chunky",
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v4-37-k", productId: "fallback-4", size: "37", color: "Black", stock: 10, sku: "DR-04-BK-37" },
      { id: "v4-38-k", productId: "fallback-4", size: "38", color: "Black", stock: 12, sku: "DR-04-BK-38" },
      { id: "v4-39-k", productId: "fallback-4", size: "39", color: "Black", stock: 9, sku: "DR-04-BK-39" },
      { id: "v4-40-k", productId: "fallback-4", size: "40", color: "Black", stock: 5, sku: "DR-04-BK-40" },
    ]
  },
  {
    id: "fallback-5",
    name: "Light Casual Comfort Sneakers",
    description: "Lightweight casual sporty shoes crafted from high-quality materials for ultimate comfort during walking and long standing, with an attractive classic design.",
    price: 1350,
    compareAtPrice: null,
    category: "lifestyle",
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&auto=format&fit=crop&q=80",
    ],
    variants: [
      { id: "v5-38-k", productId: "fallback-5", size: "38", color: "Black", stock: 8, sku: "DR-05-BK-38" },
      { id: "v5-39-k", productId: "fallback-5", size: "39", color: "Black", stock: 10, sku: "DR-05-BK-39" },
      { id: "v5-40-k", productId: "fallback-5", size: "40", color: "Black", stock: 4, sku: "DR-05-BK-40" },
      { id: "v5-38-br", productId: "fallback-5", size: "38", color: "Brown", stock: 6, sku: "DR-05-BR-38" },
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
