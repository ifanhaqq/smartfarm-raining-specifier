import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function insertStream(w1_hum: number, 
                                           w1_temp: number, 
                                           w1_noise: number, 
                                           w1_pm25: number, 
                                           w1_pm10: number, 
                                           w1_press: number, 
                                           w1_luxh: number, 
                                           w1_luxl: number,
                                           w2_wd: number,
                                           w2_ws_avg: number,
                                           w2_ws_max: number,
                                           w2_rain_h: number,
                                           w2_rain_d: number,
                                           w2_temp: number,
                                           w2_hum: number,
                                           w2_press: number) {
    await prisma.sensors.create({
        data: {
            w1_hum,
            w1_temp,
            w1_noise,
            w1_pm25,
            w1_pm10,
            w1_press,
            w1_luxh,
            w1_luxl,
            w2_wd,
            w2_ws_avg,
            w2_ws_max,
            w2_rain_h,
            w2_rain_d,
            w2_temp,
            w2_hum,
            w2_press,
        }
    });
}