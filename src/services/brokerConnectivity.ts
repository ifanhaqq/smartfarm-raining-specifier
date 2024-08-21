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

        queryHandler.insertMessage(data.cloud, data.thermostat, data.eye, data.pressure, data.wind, data.noise, data.temperature, data.rain, timestamp)
            .then(async () => {
                const sensorLogs = await prisma.sensorLogs.findMany()
                console.log(sensorLogs);

                await prisma.$disconnect();
            })
            .catch(async (e) => {
                console.error(e);
                await prisma.$disconnect();
                process.exit(1);
            });
    });

    client.on("close", () => {
        console.log("Connection closed.")
    });
}