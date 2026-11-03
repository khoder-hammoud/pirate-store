const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Prisma connected to PostgreSQL");
        return prisma;
    } catch (error) {
        console.error("❌ Prisma connection failed:", error);
        process.exit(1);
    }
};

module.exports = { prisma, connectDB };
