import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function insertMessage(cloud: number, thermostat: number, eye: number, pressure: number, wind: number, noise: number, temperature: number, rain: number, timestamp: string) {
    await prisma.sensorLogs.create({
        data: {
            cloud: cloud,
            thermostat: thermostat,
            eye: eye,
            pressure: pressure,
            wind: wind,
            noise: noise,
            temperature: temperature,
            rain: rain,
            timestamp: timestamp
        }
    });
}