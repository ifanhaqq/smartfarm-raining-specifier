import getTodayStatus from '../queries/getTodayStatus';
import insertMessage from '../queries/insertMessage';


export class QueryHandler {

    public getTodayStatus(date: any) {
        const todayStatus = getTodayStatus(date);

        return todayStatus;
    }

    public async insertMessage(cloud: number, thermostat: number, eye: number, pressure: number, wind: number, noise: number, temperature: number, rain: number, timestamp: string) {
        insertMessage(cloud, thermostat, eye, pressure, wind, noise, temperature, rain, timestamp);
    }
}