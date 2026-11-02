import { cache } from "react";
import { unstable_cache } from "next/cache";
import prisma from "@/lib/prisma";
import { ProductWithVariants } from "@/components/ProductCard";
import {
  CATALOG_PRODUCT_IDS,
  CATALOG_PRODUCTS,
  CatalogProduct,
} from "@/lib/productCatalog";
import { getProductPath, slugifyProductName } from "@/lib/productSlug";

function buildVariants(product: CatalogProduct) {
  return product.sizes.map((size, index) => ({
    id: `${product.id}-${size}`,
    productId: product.id,
    size,
    stock: index % 3 === 0 ? 0 : Math.max(product.stock - (index % 2), 1),
  }));
}

function toProductWithVariants(product: CatalogProduct): ProductWithVariants {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    category: product.category,
    subcategory: product.subcategory,
    images: [product.image],
    brand: product.brand,
    sku: `DR-${product.id.toUpperCase()}`,
    color: product.color,
    variants: buildVariants(product),
    rating: product.rating,
    reviewsCount: product.reviewsCount,
  };
}

function enrichCatalogProduct(
  product: ProductWithVariants,
): ProductWithVariants {
  const catalogProduct = CATALOG_PRODUCTS.find(
    (item) => item.id === product.id,
  );
  if (!catalogProduct) return product;

  return {
    ...product,
    name: product.name || catalogProduct.name,
    description: product.description || catalogProduct.description,
    price: product.price || catalogProduct.price,
    compareAtPrice: product.compareAtPrice ?? catalogProduct.compareAtPrice,
    category: product.category || catalogProduct.category,
    subcategory: product.subcategory ?? catalogProduct.subcategory,
    images: product.images.length > 0 ? product.images : [catalogProduct.image],
    brand: product.brand || catalogProduct.brand,
    color: product.color ?? catalogProduct.color,
    rating: product.rating ?? catalogProduct.rating,
    reviewsCount: product.reviewsCount ?? catalogProduct.reviewsCount,
  };
}

const PRODUCT_CACHE_SECONDS = 60;
const PRODUCT_VARIANT_SELECT = {
  id: true,
  productId: true,
  size: true,
  stock: true,
  price: true,
  compareAtPrice: true,
  wholesalePrice: true,
  additionalCost: true,
} as const;

const PRODUCT_SELECT = {
  id: true,
  slug: true,
  name: true,
  description: true,
  sku: true,
  price: true,
  compareAtPrice: true,
  category: true,
  subcategory: true,
  brand: true,
  color: true,
  images: true,
  rating: true,
  reviewsCount: true,
  variants: { select: PRODUCT_VARIANT_SELECT },
} as const;

type SelectedProduct = Awaited<ReturnType<typeof fetchActiveProducts>>[number];

async function fetchActiveProducts() {
  return prisma.product.findMany({
    where: { status: "active" },
    select: PRODUCT_SELECT,
    orderBy: { createdAt: "desc" },
  });
}

function serializeProduct(product: SelectedProduct): ProductWithVariants {
  return enrichCatalogProduct({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    sku: product.sku,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice == null ? null : Number(product.compareAtPrice),
    category: product.category,
    subcategory: product.subcategory,
    images: product.images,
    brand: product.brand || undefined,
    color: product.color,
    rating: Number(product.rating),
    reviewsCount: product.reviewsCount,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      size: variant.size,
      stock: Number(variant.stock),
      price: variant.price == null ? null : Number(variant.price),
      compareAtPrice: variant.compareAtPrice == null ? null : Number(variant.compareAtPrice),
      wholesalePrice: variant.wholesalePrice == null ? null : Number(variant.wholesalePrice),
      additionalCost: variant.additionalCost == null ? null : Number(variant.additionalCost),
    })),
  });
}

const getCachedActiveProducts = unstable_cache(
  async () => (await fetchActiveProducts()).map(serializeProduct),
  ["deroma-active-products-v2"],
  { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products"] },
);

const getCachedProductIndex = unstable_cache(
  async () => prisma.product.findMany({
    where: { status: "active" },
    select: { id: true, slug: true, name: true },
  }),
  ["deroma-active-product-index-v2"],
  { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products"] },
);

function getCachedProductById(id: string) {
  return unstable_cache(
    async () => {
      const product = await prisma.product.findUnique({
        where: { id },
        select: PRODUCT_SELECT,
      });
      return product ? serializeProduct(product) : null;
    },
    ["deroma-product-by-id-v2", id],
    { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products", `product:${id}`] },
  )();
}

export const FALLBACK_PRODUCTS: ProductWithVariants[] = CATALOG_PRODUCTS.map(
  toProductWithVariants,
);

// The bundled catalog is useful while developing without a database, but it
// must never appear on the live storefront when the production database has a
// transient connection problem.
const canUseFallbackCatalog = process.env.NODE_ENV !== "production";

export { getProductPath };

export const getActiveProducts = cache(async function getActiveProducts(): Promise<ProductWithVariants[]> {
  try {
    return await getCachedActiveProducts();
  } catch (error) {
    console.warn("Database connection issue while loading products:", error);
  }

  return canUseFallbackCatalog ? FALLBACK_PRODUCTS : [];
});

export const getProductsByIds = cache(async function getProductsByIds(ids: string[]): Promise<ProductWithVariants[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (!uniqueIds.length) return [];

  try {
    const getCachedRelatedProducts = unstable_cache(
      async () => (await prisma.product.findMany({
        where: { id: { in: uniqueIds }, status: "active" },
        select: PRODUCT_SELECT,
      })).map(serializeProduct),
      ["deroma-related-products-v2", ...uniqueIds.slice().sort()],
      { revalidate: PRODUCT_CACHE_SECONDS, tags: ["products"] },
    );
    const products = await getCachedRelatedProducts();
    return uniqueIds.flatMap((id) => {
      const product = products.find((candidate) => candidate.id === id);
      return product ? [product] : [];
    });
  } catch (error) {
    console.warn("Database connection issue while loading related products:", error);
    return [];
  }
});

export const getProductById = cache(async function getProductById(
  id: string,
): Promise<ProductWithVariants | null> {
  const fallbackProduct = FALLBACK_PRODUCTS.find((p) => p.id === id);

  try {
    const product = await getCachedProductById(id);

    if (product) {
      return product;
    }
  } catch (error) {
    console.warn("Database error during getProductById:", error);
  }

  try {
    const products = await getCachedProductIndex();
    const matchedProduct = products.find(
      (product) => slugifyProductName(product.name) === id,
    );
    if (matchedProduct) {
      return await getCachedProductById(matchedProduct.id);
    }
  } catch (error) {
    console.warn("Database error during slug product lookup:", error);
  }

  return canUseFallbackCatalog ? fallbackProduct || null : null;
});
