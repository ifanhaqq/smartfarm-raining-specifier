import { QueryHandler } from "../services/QueryHandler";

export default async function getWeeklyStatus(date: any, day: number) {

    const today = date.toISOString().substring(0, 10);
    const todayDate = parseInt(today.substring(8));
    const todayWithoutDate = today.substring(0, 8);
    const queryHandler: QueryHandler = new QueryHandler();

    const aWeek: string[] = [];

    for (let index = todayDate; index > todayDate - day; index--) {

        const date = todayWithoutDate + index.toString()

        aWeek.push(date)
    }

    const rainReport: number[] = [];

    for (let index = 0; index < aWeek.length; index++) {
        const dailyStatus: any = await queryHandler.getTodayStatus(aWeek[index]);
        let isRaining: number = 0;

        if (dailyStatus.length > 0) {
            dailyStatus.forEach((rainStatus: { w2_rain_h: any; w2_rain_d: any }) => {

                if (rainStatus.w2_rain_h > 0 || rainStatus.w2_rain_d > 0) {
                    isRaining = isRaining + 1;
                }
            });

            (isRaining > 0) ? rainReport.push(1) : rainReport.push(-1);
        } else {
            rainReport.push(-1);
        }

    }

    const reportJson = JSON.stringify(rainReport)

    return JSON.stringify(reportJson);


}













