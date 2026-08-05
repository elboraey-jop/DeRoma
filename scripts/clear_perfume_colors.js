const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.product.updateMany({
    where: {
      category: { equals: "perfumes", mode: "insensitive" },
    },
    data: {
      color: "",
    },
  });
  console.log("Updated perfume products count in database:", result.count);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
