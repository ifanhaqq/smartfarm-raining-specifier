import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function() {
    const records = await prisma.dailySensorsAverage.findMany({
        orderBy: {
            id: 'desc'
        },
        take: 30
    });

    return records;
}