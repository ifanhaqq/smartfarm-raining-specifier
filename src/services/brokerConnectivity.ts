import mqtt, { MqttClient } from "mqtt";
import { PrismaClient } from "@prisma/client";
import { QueryHandler } from "../services/QueryHandler";
import getTodayStatus from "../queries/getTodayStatus";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min); // Rounds up to the nearest whole number
  max = Math.floor(max); // Rounds down to the nearest whole number
  return Math.floor(Math.random() * (max - min + 1)) + min; // The +1 ensures max is inclusive
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

  client.on("message", async (topic: string, message: Buffer) => {
    const data = JSON.parse(message.toString());
    const date = new Date();

    // await queryHandler
    //   .insertStream(
    //     data.w1_hum,
    //     data.w1_temp,
    //     data.w1_noise,
    //     data.w1_pm25,
    //     data.w1_pm10,
    //     data.w1_press,
    //     data.w1_luxh,
    //     data.w1_luxl,
    //     data.w2_wd,
    //     data.w2_ws_avg,
    //     data.w2_ws_max,
    //     data.w2_rain_h,
    //     data.w2_rain_d,
    //     data.w2_temp,
    //     data.w2_hum,
    //     data.w2_press
    //   )
    //   .then(async () => {
    //     console.log(1);
    //   })
    //   .catch(async (e) => {
    //     console.error(e);
    //     await prisma.$disconnect();
    //     process.exit(1);
    //   });

    if (date.getHours() === 7) {
      const yesterday = new Date(date);
      yesterday.setDate(date.getDate() - 1);
      const yesterdayString = yesterday.toISOString().substring(0, 10);
      const data = `${date.toISOString().substring(0, 10)}%`;

      const checkDate = await prisma.$queryRaw`
        SELECT * FROM "DailySensorsAverage" WHERE "createdAt"::TEXT LIKE ${data}
      `;

      if (Array.isArray(checkDate) && checkDate.length === 0) {
        const sensors: any = await getTodayStatus(yesterdayString);
        if (Array.isArray(sensors) && sensors.length > 0) {
          const fieldNames = [
            "w1_hum",
            "w1_temp",
            "w1_noise",
            "w1_pm25",
            "w1_pm10",
            "w1_press",
            "w1_luxh",
            "w1_luxl",
            "w2_wd",
            "w2_ws_avg",
            "w2_ws_max",
            "w2_rain_h",
            "w2_rain_d",
            "w2_temp",
            "w2_hum",
            "w2_press",
          ];

          const averagesDailySensors = fieldNames.reduce(
            (acc: any, field: any) => {
              acc[field] =
                sensors!.reduce(
                  (sum: number, record: any) => sum + record[field],
                  0
                ) / sensors.length;
              return acc;
            },
            {}
          );

          console.log(averagesDailySensors);

          await prisma.dailySensorsAverage.create({
            data: { ...averagesDailySensors },
          });

          console.log("Daily averages calculated and saved successfully.");
        } else {
            console.log("No data to be inserted for today!")
        }
      } else {
        console.log("Data for today already inserted");
      }
    } else {
      console.log("Not the right time for inserting data!");
    }
  });

  if (publishStatus) {
    const randomNpk = () => {
      return {
        n: getRandomInt(60, 90),
        p: getRandomInt(42, 58),
        k: getRandomInt(40, 50),
        temperature: getRandomInt(15, 40),
        humidity: getRandomInt(0, 100),
        ph: Math.floor(Math.random() * (9.9 - 0.1) + 0.1).toFixed(2),
        ldr: getRandomInt(700, 1500),
        rainfall: getRandomInt(0, 250),
        typeday: getRandomInt(0, 1),
        label: "rice",
      };
    };

    setInterval(() => {
      const data = randomNpk();

      const message = JSON.stringify(data);
      client.publish("test/polindra", message, (error) => {
        console.log(error);
      });
    }, 3000);
  }

  client.on("close", () => {
    console.log("Connection closed.");
  });
}
