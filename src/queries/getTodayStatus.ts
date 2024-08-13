import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getTodayStatus(date: any) {
    const data = `${date}%`
    const query = await prisma.$queryRaw`
        SELECT * FROM "SensorLogs" WHERE "createdAt"::TEXT LIKE ${data}
    `

    return query
}

// export default async function getTodayStatus() {
//     const query = await prisma.$queryRaw`
//         SELECT * FROM "SensorLogs" WHERE "timestamp" LIKE '15%'
//     `

//     console.log(query)
// }