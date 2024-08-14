import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import brokerConnectivity from "./src/services/brokerConnectivity";
import { QueryHandler } from "./src/services/QueryHandler";
import bodyParser from "body-parser"

dotenv.config();

brokerConnectivity();

async function main() {
    const app: Express = express();
    const port = process.env.PORT || 3000;
    const queryHandler: QueryHandler = new QueryHandler();

    app.use(express.json());

    app.use(bodyParser.json())

    app.get('/', (req: Request, res: Response) => {
        res.send("Lorem ipsum");
    });

    app.get('/today', async (req: Request, res: Response) => {
        const date = new Date();

        const today = date.toISOString().substring(0, 10);

        const todayRain = await queryHandler.getTodayStatus(today);
        res.send(todayRain);
    });

    app.post('/specified-time', async (req: Request, res: Response) => {
        const date:any = req.body.date;
        (!date) ? res.send("Please input some date") : res.send(req.body);
    });

    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
}

main();







