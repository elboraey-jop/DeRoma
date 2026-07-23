import { PrismaClient } from '@prisma/client';

async function testIpAndPort(ip: string, port: number) {
  const url = `postgresql://postgres.ffplewcfhccvoiirhwun:DeRoma.123%23@${ip}:${port}/postgres?sslmode=require`;
  console.log(`Testing connection directly to IP ${ip} on port ${port}...`);
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  try {
    const start = Date.now();
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`Success on ${ip}:${port}! Time: ${Date.now() - start}ms.`);
    return true;
  } catch (err: any) {
    console.error(`Failed on ${ip}:${port}:`, err.message || err);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function run() {
  const ips = ['34.241.16.247', '52.209.89.87', '108.128.216.176'];
  console.log('--- STARTING IP DIRECT TESTS ---');
  for (const ip of ips) {
    await testIpAndPort(ip, 6543);
    await testIpAndPort(ip, 5432);
  }
  console.log('--- IP DIRECT TESTS COMPLETED ---');
}

run();
