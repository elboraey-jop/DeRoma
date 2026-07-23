import { PrismaClient } from '@prisma/client';

async function test() {
  console.log('Testing connection using DIRECT_URL...');
  const prisma = new PrismaClient({
    datasources: {
      db: {
      url: "postgresql://postgres.ffplewcfhccvoiirhwun:DeRoma.123%23@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"
      }
    }
  });

  try {
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Success! Result:', result);
  } catch (err) {
    console.error('Failed to connect:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
