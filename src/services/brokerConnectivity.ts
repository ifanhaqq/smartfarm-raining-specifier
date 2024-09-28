import mqtt, { MqttClient } from "mqtt";
import { PrismaClient } from '@prisma/client';
import { QueryHandler } from "../services/QueryHandler"

function getRandomInt(min: number, max: number) {
    min = Math.ceil(min);  // Rounds up to the nearest whole number
    max = Math.floor(max); // Rounds down to the nearest whole number
    return Math.floor(Math.random() * (max - min + 1)) + min;  // The +1 ensures max is inclusive
}

export default function brokerConnectivity(publishStatus: boolean) {
    const broker: any = process.env.BROKER_URL;
    const client: MqttClient | null = mqtt.connect(broker);
    const prisma = new PrismaClient();
    const queryHandler: QueryHandler = new QueryHandler();

    client.on("connect", () => {
        console.log("Connected to the broker");
        client.subscribe("my-topic/polindra", (err) => {
            if (!err) {
                console.log(`Successfully subscribed`);
            }
        });
    });

    client.on("message", (topic: string, message: Buffer) => {
        const data = JSON.parse(message.toString());
        const date = new Date();

        // queryHandler.insertStream(data.w1_hum, data.w1_temp, data.w1_noise, data.w1_pm25, data.w1_pm10, data.w1_press, data.w1_luxh, data.w1_luxl, data.w2_wd, data.w2_ws_avg, data.w2_ws_max, data.w2_rain_h, data.w2_rain_d, data.w2_temp, data.w2_hum, data.w2_press)
        //         .then(async() => {
        //             console.log(sensor);
        //         })
        //         .catch(async (e) => {
        //             console.error(e);
        //             await prisma.$disconnect();
        //             process.exit(1);
        //         })
    });

    if (publishStatus) {
        const randomNpk = () => {
            return {
                "n": getRandomInt(60, 90),
                "p": getRandomInt(42, 58),
                "k": getRandomInt(40, 50),
                "temperature": getRandomInt(15, 40),
                "humidity": getRandomInt(0, 100),
                "ph": Math.floor(Math.random() * (9.9 - 0.1) + 0.1).toFixed(2),
                "ldr": getRandomInt(700, 1500),
                "rainfall": getRandomInt(0, 250),
                "typeday": getRandomInt(0, 1),
                "label": "rice"

            }
        }


        setInterval(() => {
            const data = randomNpk()

            const message = JSON.stringify(data)
            client.publish("test/polindra", message, (error) => {
                console.log(error)
            })
        }, 3000)
    }

    client.on("close", () => {
        console.log("Connection closed.")
    });
}