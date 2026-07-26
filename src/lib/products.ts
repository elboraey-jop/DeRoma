import prisma from "@/lib/prisma";
import { ProductWithVariants } from "@/components/ProductCard";
import { CATALOG_PRODUCT_IDS, CATALOG_PRODUCTS, CatalogProduct } from "@/lib/productCatalog";

function buildVariants(product: CatalogProduct) {
  return product.sizes.map((size, index) => ({
    id: `${product.id}-${size}`,
    productId: product.id,
    size,
    color: product.color,
    stock: (index % 3 === 0) ? 0 : Math.max(product.stock - (index % 2), 1),
    sku: `DR-${product.id.toUpperCase()}-${size}`,
  }));
}

function buildColorways(product: CatalogProduct) {
  return CATALOG_PRODUCTS.filter((item) => item.modelKey === product.modelKey).map((item) => ({
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

function enrichCatalogProduct(product: ProductWithVariants): ProductWithVariants {
  const catalogProduct = CATALOG_PRODUCTS.find((item) => item.id === product.id);
  if (!catalogProduct) return product;

  return {
    ...product,
    brand: catalogProduct.brand,
    modelKey: catalogProduct.modelKey,
    colorLabel: catalogProduct.colorLabel,
    colorHex: catalogProduct.colorHex,
    colorways: buildColorways(catalogProduct),
    rating: catalogProduct.rating,
    reviewsCount: catalogProduct.reviewsCount,
  };
}

export const FALLBACK_PRODUCTS: ProductWithVariants[] = CATALOG_PRODUCTS.map(toProductWithVariants);

export async function getActiveProducts(): Promise<ProductWithVariants[]> {
  try {
    const dbProducts = await prisma.product.findMany({
      where: { status: "active", id: { in: CATALOG_PRODUCT_IDS } },
      include: { variants: true },
      orderBy: { createdAt: "desc" },
    });

    if (dbProducts && dbProducts.length === FALLBACK_PRODUCTS.length) {
      const products = dbProducts.map((p) =>
        enrichCatalogProduct({
          ...p,
          price: Number(p.price),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          variants: p.variants.map((v) => ({
            ...v,
            stock: Number(v.stock),
          })),
        } as ProductWithVariants)
      );

      return CATALOG_PRODUCT_IDS.map((id) => products.find((product) => product.id === id)).filter(
        Boolean
      ) as ProductWithVariants[];
    }
  } catch (error) {
    console.warn("Database connection issue. Using fallback products dataset:", error);
  }

  return FALLBACK_PRODUCTS;
}

export async function getProductById(id: string): Promise<ProductWithVariants | null> {
  const fallbackProduct = FALLBACK_PRODUCTS.find((p) => p.id === id);
  if (fallbackProduct) return fallbackProduct;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (product && CATALOG_PRODUCT_IDS.includes(product.id)) {
      return enrichCatalogProduct({
        ...product,
        price: Number(product.price),
        compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
        variants: product.variants.map((v) => ({
          ...v,
          stock: Number(v.stock),
        })),
      } as ProductWithVariants);
    }
  } catch (error) {
    console.warn("Database error during getProductById:", error);
  }

  return null;
}
