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

async function sortShopProducts() {
  const execute = process.argv.includes("--execute");
  const products = await prisma.product.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      variants: { select: { stock: true } },
    },
    orderBy: [{ shopSortOrder: "asc" }, { createdAt: "desc" }],
  });

  const rankedProducts = products
    .map((product, originalIndex) => rankProduct(product, originalIndex))
    .sort(compareProducts);

  console.log("Shop products sorting preview");
  console.log("- Primary sort: available sizes (descending)");
  console.log("- Secondary sort: total stock quantity (descending)");
  console.log("- Ties: current shop order");
  console.log(`- Active products: ${rankedProducts.length}`);
  console.log("\nNew order:");

  rankedProducts.forEach((product, index) => {
    console.log(
      `${index + 1}. ${product.name} | ${product.availableSizes} available sizes | ${product.totalStock} units`,
    );
  });

  if (!execute) {
    console.log("\nNo changes made. Run with --execute to save this order.");
    return;
  }

  await prisma.$transaction(
    rankedProducts.map((product, index) =>
      prisma.product.update({
        where: { id: product.id },
        data: { shopSortOrder: index },
      }),
    ),
  );

  console.log("\nShop product order saved successfully.");
}

sortShopProducts()
  .catch((error) => {
    console.error("Shop product sorting failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
