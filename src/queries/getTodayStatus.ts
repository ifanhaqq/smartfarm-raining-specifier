import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getTodayStatus(date: any) {
    const data = `${date}%`;
    const query = await prisma.$queryRaw`
        SELECT * FROM "Sensors" WHERE "createdAt"::TEXT LIKE ${data}
    `;
    
    return query;
}