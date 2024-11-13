import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function generateRecords() {
  function getRandomFloat(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  const records: {
    w1_hum: number;
    w1_temp: number;
    w1_noise: number;
    w1_pm25: number;
    w1_pm10: number;
    w1_press: number;
    w1_luxh: number;
    w1_luxl: number;
    w2_wd: number;
    w2_ws_avg: number;
    w2_ws_max: number;
    w2_rain_h: number;
    w2_rain_d: number;
    w2_temp: number;
    w2_hum: number;
    w2_press: number;
  }[] = [];

  for (let index = 0; index < 30; index++) {
    const record = {
      w1_hum: getRandomFloat(1, 100),
      w1_temp: getRandomFloat(15, 35),
      w1_noise: getRandomFloat(30, 70),
      w1_pm25: getRandomFloat(1.1, 9.9),
      w1_pm10: getRandomFloat(1.1, 9.9),
      w1_press: getRandomFloat(75, 150),
      w1_luxh: getRandomFloat(0.1, 10),
      w1_luxl: getRandomFloat(1, 1000),
      w2_wd: 0,
      w2_ws_avg: getRandomFloat(0, 10),
      w2_ws_max: getRandomFloat(0, 10),
      w2_rain_h: getRandomFloat(0, 100),
      w2_rain_d: getRandomFloat(0, 100),
      w2_temp: getRandomFloat(15, 35),
      w2_hum: getRandomFloat(1, 100),
      w2_press: getRandomFloat(75, 150),
    };

    records.push(record);
  }

  return records;
}

async function main() {
  await prisma.dailySensorsAverage.createMany({
    data: generateRecords(),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(e);
    await prisma.$disconnect();
    process.exit(1);
  });
