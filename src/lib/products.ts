import prisma from "@/lib/prisma";
import { ProductWithVariants } from "@/components/ProductCard";
import {
  CATALOG_PRODUCT_IDS,
  CATALOG_PRODUCTS,
  CatalogProduct,
} from "@/lib/productCatalog";

function buildVariants(product: CatalogProduct) {
  return product.sizes.map((size, index) => ({
    id: `${product.id}-${size}`,
    productId: product.id,
    size,
    color: product.color,
    stock: index % 3 === 0 ? 0 : Math.max(product.stock - (index % 2), 1),
    sku: `DR-${product.id.toUpperCase()}-${size}`,
  }));
}

function buildColorways(product: CatalogProduct) {
  return CATALOG_PRODUCTS.filter(
    (item) => item.modelKey === product.modelKey,
  ).map((item) => ({
    productId: item.id,
    color: item.color,
    label: item.colorLabel,
    hex: item.colorHex,
    image: item.image,
    name: item.name,
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
    modelKey: product.modelKey,
    colorLabel: product.colorLabel,
    colorHex: product.colorHex,
    colorways: buildColorways(product),
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
    modelKey: catalogProduct.modelKey,
    colorLabel: catalogProduct.colorLabel,
    colorHex: catalogProduct.colorHex,
    colorways: buildColorways(catalogProduct),
    rating: product.rating ?? catalogProduct.rating,
    reviewsCount: product.reviewsCount ?? catalogProduct.reviewsCount,
  };
}

export const FALLBACK_PRODUCTS: ProductWithVariants[] = CATALOG_PRODUCTS.map(
  toProductWithVariants,
);

export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "active" },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    return dbProducts.map((p) =>
      enrichCatalogProduct({
        ...p,
        price: Number(p.price),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        rating: Number(p.rating),
        reviewsCount: p.reviewsCount,
        variants: p.variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
        })),
      } as ProductWithVariants),
    );
  } catch (error) {
    console.warn(
      "Database connection issue. Using fallback products dataset:",
      error,
    );
  }

  return FALLBACK_PRODUCTS;
}

export async function getProductById(
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
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice
          ? Number(product.compareAtPrice)
          : null,
        rating: Number(product.rating),
        reviewsCount: product.reviewsCount,
        variants: product.variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
        })),
      } as ProductWithVariants);
    }
  } catch (error) {
    console.warn("Database error during getProductById:", error);
  }

  return fallbackProduct || null;
}
