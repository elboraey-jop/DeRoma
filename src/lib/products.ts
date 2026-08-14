import { cache } from "react";
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

export const FALLBACK_PRODUCTS: ProductWithVariants[] = CATALOG_PRODUCTS.map(
  toProductWithVariants,
);

export { getProductPath };

export const getActiveProducts = cache(async function getActiveProducts(): Promise<ProductWithVariants[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    return dbProducts.map((p) =>
      enrichCatalogProduct({
        id: p.id,
        name: p.name,
        description: p.description,
        sku: p.sku,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice == null ? null : Number(p.compareAtPrice),
        category: p.category,
        subcategory: p.subcategory,
        images: p.images,
        brand: p.brand || undefined,
        color: p.color,
        rating: Number(p.rating),
        reviewsCount: p.reviewsCount,
        variants: p.variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          size: v.size,
          stock: Number(v.stock),
          price: v.price == null ? null : Number(v.price),
          compareAtPrice: v.compareAtPrice == null ? null : Number(v.compareAtPrice),
          wholesalePrice: v.wholesalePrice == null ? null : Number(v.wholesalePrice),
          additionalCost: v.additionalCost == null ? null : Number(v.additionalCost),
        })),
      }),
    );
  } catch (error) {
    console.warn(
      "Database connection issue. Using fallback products dataset:",
      error,
    );
  }

  return FALLBACK_PRODUCTS;
});

export const getProductById = cache(async function getProductById(
  id: string,
): Promise<ProductWithVariants | null> {
  const fallbackProduct = FALLBACK_PRODUCTS.find((p) => p.id === id);

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (product) {
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
        variants: product.variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          size: v.size,
          stock: Number(v.stock),
          price: v.price == null ? null : Number(v.price),
          compareAtPrice: v.compareAtPrice == null ? null : Number(v.compareAtPrice),
          wholesalePrice: v.wholesalePrice == null ? null : Number(v.wholesalePrice),
          additionalCost: v.additionalCost == null ? null : Number(v.additionalCost),
        })),
      });
    }
  } catch (error) {
    console.warn("Database error during getProductById:", error);
  }

  try {
    const products = await prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
    });
    const matchedProduct = products.find(
      (product) => slugifyProductName(product.name) === id,
    );
    if (matchedProduct) {
      return enrichCatalogProduct({
        id: matchedProduct.id,
        name: matchedProduct.name,
        description: matchedProduct.description,
        sku: matchedProduct.sku,
        price: Number(matchedProduct.price),
        compareAtPrice: matchedProduct.compareAtPrice == null ? null : Number(matchedProduct.compareAtPrice),
        category: matchedProduct.category,
        subcategory: matchedProduct.subcategory,
        images: matchedProduct.images,
        brand: matchedProduct.brand || undefined,
        color: matchedProduct.color,
        rating: Number(matchedProduct.rating),
        reviewsCount: matchedProduct.reviewsCount,
        variants: matchedProduct.variants.map((variant) => ({
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
  } catch (error) {
    console.warn("Database error during slug product lookup:", error);
  }

  return fallbackProduct || null;
});
