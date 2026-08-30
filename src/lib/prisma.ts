import { PrismaClient } from '@prisma/client';

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl || (process.env.NODE_ENV !== 'production' && process.env.VERCEL !== '1')) {
    return databaseUrl;
  }

  try {
    const url = new URL(databaseUrl);
    // Keep each serverless Prisma instance to one connection. This prevents
    // concurrent Vercel functions from exhausting Supabase's pooler limit.
    // Force the serverless-safe value even if the connection string was
    // copied from a local environment with a larger pool size.
    url.searchParams.set('connection_limit', '1');
    return url.toString();
  } catch {
    return databaseUrl;
  }
}

const prismaClientSingleton = () => {
  const databaseUrl = getDatabaseUrl();
  return new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
