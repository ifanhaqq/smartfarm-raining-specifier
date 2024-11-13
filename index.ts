import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import brokerConnectivity from "./src/services/brokerConnectivity";
import { QueryHandler } from "./src/services/QueryHandler";
import bodyParser from "body-parser";
import countNeracaAir from "./src/queries/countNeracaAir";
import getGroundWaterStatus from "./src/queries/getGroundWaterStatus";
import predictionService from "./src/services/predictionService";
import getTodayStatus from "./src/queries/getTodayStatus";
import { Prisma, PrismaClient } from "@prisma/client";
import getMonthlyStats from "./src/queries/getMonthlyStats";

const path = require("path");

dotenv.config();

const publishing: boolean = true;

// Maintain connection with the mqtt broker
brokerConnectivity(publishing);

async function main() {
  const app: Express = express();
  const port = 3000;
  const host = "0.0.0.0";
  const queryHandler: QueryHandler = new QueryHandler();

  app.use(express.static(path.join(__dirname, "public")));

  app.use(express.json());

  app.use(bodyParser.json());

  app.get("/", (req: Request, res: Response) => {
    res.send("Lorem ipsum");
  });

  app.get("/today", async (req: Request, res: Response) => {
    const date = new Date();

    const today = date.toISOString().substring(0, 10);

    const todayRain = await queryHandler.getTodayStatus(today);
    res.send(todayRain);
  });

  app.post("/neraca", async (req: Request, res: Response) => {
    const data: any = await countNeracaAir(parseInt(req.body.month));

    console.log(data);
    res.json(data);
  });

  app.post("/specified-time", async (req: Request, res: Response) => {
    const date: any = req.body.date;
    !date ? res.send("Please input some date") : res.send(req.body);
  });

  app.post("/rain-history", async (req: Request, res: Response) => {
    const date = new Date();
    const day = req.body.day;
    const history: any = await queryHandler.rainHistory(date, day);

    res.send(history);
  });

  app.post("/rain-history-calendar", async (req: Request, res: Response) => {
    const date = new Date(req.body.end_day);
    const day = req.body.day;

    try {
      const history: any = await queryHandler.rainHistory(date, day);
      res.send(history);
    } catch (error) {
      res.send(error);
    }
  });

  app.post("/predict", async (req: Request, res: Response) => {
    let prediction: { tAvg: number; rr: number }[] = [];

    const data = [
      [29.7, 0],
      [31.3, 0],
      [29.8, 0],
      [28.5, 20.5],
      [29.3, 0],
      [28.4, 0],
      [28.2, 0],
      [28.5, 1.2],
      [29.6, 8.3],
      [29.7, 0],
      [27.9, 2.1],
      [25.7, 0],
      [27.4, 4.5],
      [27.5, 3.5],
      [29.4, 0],
      [28.1, 0],
      [28.5, 0],
      [28.7, 0],
      [27.5, 8.1],
      [28.7, 5.5],
      [28.2, 9.7],
      [29.3, 0],
      [28.7, 0],
      [27.4, 13],
      [28, 0],
      [28.5, 0],
      [28.4, 0],
      [27.6, 1.8],
      [28.5, 61],
      [26.4, 6],
    ];

    const result = await predictionService(new Date());

    // console.log(typeof result);

    if (result.length === 0) return res.json(1);

    const userId = req.body.user_id;
    const fieldId = req.body.field_id;
    console.log(req.body)
    
    // const calculation = await getGroundWaterStatus(result, userId, fieldId);

    return res.json(result);
  });

  app.get("/dummy", async (req: Request, res: Response) => {
    const prisma = new PrismaClient();
    const dailySensors = await getMonthlyStats();
    console.log(dailySensors);

    return res.json(JSON.stringify(dailySensors, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ))
  });

  app.listen(port, host, () => {
    console.log(`[server]: Server is running at http://${host}:${port}`);
  });
}

main();
