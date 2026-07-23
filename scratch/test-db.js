const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":[MASKED_PASSWORD]@") : "undefined");
console.log("DIRECT_URL:", process.env.DIRECT_URL ? process.env.DIRECT_URL.replace(/:[^:@]+@/, ":[MASKED_PASSWORD]@") : "undefined");

async function testConnection(urlName, urlValue) {
  console.log(`\nTesting connection via ${urlName}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: urlValue
      }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as result`;
    console.log(`SUCCESS for ${urlName}! Result:`, result);
  } catch (error) {
    console.error(`FAILED for ${urlName}! Error:`, error.message || error);
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  await testConnection("DATABASE_URL", process.env.DATABASE_URL);
  await testConnection("DIRECT_URL", process.env.DIRECT_URL);
}

run();
