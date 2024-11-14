import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function getDailySensorsAvg() {
    const records = await prisma.dailySensorsAverage.findMany({
        orderBy: {
            id: 'desc'
        }
    });

    return records;
}