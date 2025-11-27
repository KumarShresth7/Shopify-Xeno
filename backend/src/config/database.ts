import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}

// Test connection on startup
prisma.$connect()
    .then(() => console.log('✅ Database connected successfully (Prisma ORM)'))
    .catch((error) => {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    });

export default prisma;
