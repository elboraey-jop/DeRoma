import { PrismaClient } from "@prisma/client";
import { CATALOG_PRODUCT_IDS, CATALOG_PRODUCTS } from "../src/lib/productCatalog";

const prisma = new PrismaClient();

function buildVariants(product: (typeof CATALOG_PRODUCTS)[number]) {
  return product.sizes.map((size, index) => ({
    id: `${product.id}-${size}`,
    productId: product.id,
    size,
    color: product.color,
    stock: (index % 3 === 0) ? 0 : Math.max(product.stock - (index % 2), 1),
    sku: `DR-${product.id.toUpperCase()}-${size}`,
  }));
}

async function main() {
  await prisma.product.updateMany({
    where: { id: { notIn: CATALOG_PRODUCT_IDS } },
    data: { status: "draft" },
  });

  for (const product of CATALOG_PRODUCTS) {
    await prisma.product.upsert({
      where: { id: product.id },
      create: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: "active",
        category: product.category,
        images: [product.image],
      },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: "active",
        category: product.category,
        images: [product.image],
      },
    });

    for (const variant of buildVariants(product)) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        create: variant,
        update: {
          productId: variant.productId,
          size: variant.size,
          color: variant.color,
          stock: variant.stock,
        },
      });
    }
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
