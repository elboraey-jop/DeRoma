import "dotenv/config";
import prisma from "../src/lib/prisma";

type ProductForSorting = {
  id: string;
  name: string;
  variants: Array<{ stock: number }>;
};

type RankedProduct = ProductForSorting & {
  availableSizes: number;
  totalStock: number;
  originalIndex: number;
};

function rankProduct(product: ProductForSorting, originalIndex: number): RankedProduct {
  const availableSizes = product.variants.filter((variant) => variant.stock > 0).length;
  const totalStock = product.variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);

  return { ...product, availableSizes, totalStock, originalIndex };
}

function compareProducts(a: RankedProduct, b: RankedProduct) {
  return (
    b.availableSizes - a.availableSizes ||
    b.totalStock - a.totalStock ||
    a.originalIndex - b.originalIndex
  );
}

async function sortForYouProducts() {
  const execute = process.argv.includes("--execute");
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { forYouProductIds: true },
  });

  const configuredIds = settings?.forYouProductIds || [];
  const isUsingDefaultHomepageList = configuredIds.length === 0;

  const products = await prisma.product.findMany({
    where: isUsingDefaultHomepageList
      ? { status: "active" }
      : { id: { in: configuredIds }, status: "active" },
    select: {
      id: true,
      name: true,
      variants: { select: { stock: true } },
    },
    ...(isUsingDefaultHomepageList ? { orderBy: { createdAt: "desc" as const } } : {}),
  });

  const productsById = new Map(products.map((product) => [product.id, product]));
  const sourceIds = isUsingDefaultHomepageList ? products.map((product) => product.id) : configuredIds;
  const rankedProducts = sourceIds
    .map((id, originalIndex) => {
      const product = productsById.get(id);
      return product ? rankProduct(product, originalIndex) : null;
    })
    .filter((product): product is RankedProduct => Boolean(product))
    .sort(compareProducts);

  // Keep missing or inactive IDs at the end so the script never silently
  // removes an administrator's existing selection.
  const missingIds = configuredIds.filter((id) => !productsById.has(id));
  const sortedIds = [...rankedProducts.map((product) => product.id), ...missingIds];

  console.log("Homepage For You sorting preview");
  if (isUsingDefaultHomepageList) {
    console.log("- No saved For You order found; using all active homepage products.");
  }
  console.log("- Primary sort: available sizes (descending)");
  console.log("- Secondary sort: total stock quantity (descending)");
  console.log("- Ties: current order");
  console.log("\nNew order:");

  rankedProducts.forEach((product, index) => {
    console.log(
      `${index + 1}. ${product.name} | ${product.availableSizes} available sizes | ${product.totalStock} units`,
    );
  });

  if (missingIds.length > 0) {
    console.log(`\nKept ${missingIds.length} missing/inactive ID(s) at the end.`);
  }

  if (!execute) {
    console.log("\nNo changes made. Run with --execute to save this order.");
    return;
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { forYouProductIds: sortedIds },
  });

  console.log("\nHomepage For You order saved successfully.");
}

sortForYouProducts()
  .catch((error) => {
    console.error("For You sorting failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
