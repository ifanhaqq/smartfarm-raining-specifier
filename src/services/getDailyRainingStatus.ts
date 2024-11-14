import getDailySensorsAvg from "../queries/getDailySensorsAvg";

export default async function getDailyRainingStatus() {
    const records = await getDailySensorsAvg();

    const data: number[] = [];

    records.map((record) => {
        (record.w2_rain_d > 0) ? data.push(1) : data.push(0);
    })

    return data;
}