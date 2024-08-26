import mqtt, { MqttClient } from "mqtt";
import { PrismaClient } from '@prisma/client';
import { QueryHandler } from "../services/QueryHandler"


export default function brokerConnectivity() {
    const broker: any = process.env.BROKER_URL;
    const client: MqttClient | null = mqtt.connect(broker);
    const prisma = new PrismaClient();
    const queryHandler: QueryHandler = new QueryHandler();

    client.on("connect", () => {
        console.log("Connected to the broker");
        client.subscribe("test-polindra/json", (err) => {
            if (!err) {
                console.log(`Successfully subscribed`);
            }
        });
    });

    client.on("message", (topic: string, message: Buffer) => {
        const data = JSON.parse(message.toString());
        const date = new Date();
        const timestamp: string = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

        // console.log(data.w2_press)
        // queryHandler.insertMessage(data.cloud, data.thermostat, data.eye, data.pressure, data.wind, data.noise, data.temperature, data.rain, timestamp)
        //     .then(async () => {
        //         const sensorLogs = await prisma.sensorLogs.findMany()
        //         console.log(sensorLogs);

        //         await prisma.$disconnect();
        //     })
        //     .catch(async (e) => {
        //         console.error(e);
        //         await prisma.$disconnect();
        //         process.exit(1);
        //     });
        
        queryHandler.insertStream(data.w1_hum, data.w1_temp, data.w1_noise, data.w1_pm25, data.w1_pm10, data.w1_press, data.w1_luxh, data.w1_luxl, data.w2_wd, data.w2_ws_avg, data.w2_ws_max, data.w2_rain_h, data.w2_rain_d, data.w2_temp, data.w2_hum, data.w2_press)
                .then(async() => {
                    const sensor = await prisma.sensors.findMany();
                    console.log(sensor);

                    await prisma.$disconnect();
                })
                .catch(async (e) => {
                    console.error(e);
                    await prisma.$disconnect();
                    process.exit(1);
                })
    });

    client.on("close", () => {
        console.log("Connection closed.")
    });
}