import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mqtt, { MqttClient } from "mqtt";
import { PrismaClient } from '@prisma/client';
import insertMessage from "./src/queries/insertMessage";
import getTodayStatus from "./src/queries/getTodayStatus";

dotenv.config();

const broker: string = "ws://mqtt.my.id:8083/mqtt";
const client: MqttClient | null = mqtt.connect(broker);
const prisma = new PrismaClient();

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

    insertMessage(data.cloud, data.thermostat, data.eye, data.pressure, data.wind, data.noise, data.temperature, timestamp)
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

async function main() {
    const app: Express = express();
    const port = process.env.PORT || 3000;

    app.get('/', (req: Request, res: Response) => {
        res.send("Lorem ipsum");
    });

    app.get('/today', async (req: Request, res: Response) => {
        const date = new Date();

        const today = date.toISOString().substring(0, 10);

        const todayRain = await getTodayStatus(today);
        res.send(todayRain)
    });

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

main()







