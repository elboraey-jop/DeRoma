import prisma from "../src/lib/prisma";

async function run() {
  console.log("Testing connection using prisma client from src/lib/prisma...");
  try {
    const products = await prisma.product.findMany({
      where: { status: "active" }
    });
    console.log("Success! Found active products:", products.length);
  } catch (err) {
    console.error("Prisma error details:", err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
