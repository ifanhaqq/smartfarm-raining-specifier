import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getGroundWaterStatus(prediction: number[][], userId: number, fieldId: number) {
    const katMax = 550;
    const kl = 800;
    const tlp = 250;
    const getYearlyStats = await prisma.monthlyStats.findMany({
        take: 11,
        orderBy: {
            id: 'desc'
        }
    });

    const predictedTAvg = prediction.reduce((acc, item) => acc + item[0], 0) / prediction.length;
    const predictedRR = prediction.reduce((acc, item) => acc + item[1], 0) / prediction.length;

    const predictedHeatIndex = Math.pow((predictedTAvg / 5), 1.514);

    const accumulatedHeatIndex = getYearlyStats.reduce((acc, item) => acc + item.heat_index, 0) + predictedHeatIndex;
    
    const a = 675 * Math.pow(10, -9) * Math.pow(accumulatedHeatIndex, 3) - 771 * Math.pow(10, -7) * Math.pow(accumulatedHeatIndex, 2) + 1792 * Math.pow(10, -5) * accumulatedHeatIndex + 0.49239;

    const predictedEtp = 16 * Math.pow((((predictedTAvg) * 10) / accumulatedHeatIndex), a);
    
    const predictedApwl = predictedRR - predictedEtp;
    let accumulatedApwl = 0;
    if (predictedApwl < 0) {
        accumulatedApwl = getYearlyStats.reduce((acc, item) => acc + item.apwl, 0) + predictedApwl;
    }

    console.log(predictedApwl)

    const kat = katMax * Math.exp(accumulatedApwl / katMax);
    const data = {
        "kat": kat,
        "ats": (kat - tlp) / (kl - tlp) * 100
    }

    console.log(fieldId)

    await prisma.predictionsHistory.create({
        data: {
            groundwater_available: data.kat,
            groundwater_level: data.ats,
            field_id: fieldId,
            user_id: userId,
        }
    })
 
    return data;
}