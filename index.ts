import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import brokerConnectivity from "./src/services/brokerConnectivity";
import { QueryHandler } from "./src/services/QueryHandler";
import bodyParser from "body-parser";
import countNeracaAir from "./src/queries/countNeracaAir";

dotenv.config();

const publishing: boolean = true;

// Maintain connection with the mqtt broker
brokerConnectivity(publishing);

async function main() {
    const app: Express = express();
    const port = 3000;
    const host = '0.0.0.0';
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

    app.post('/neraca', async (req: Request, res: Response) => {
        const data:any = await countNeracaAir(parseInt(req.body.month));

        console.log(data)
        res.json(data)
    });

    app.post('/specified-time', async (req: Request, res: Response) => {
        const date:any = req.body.date;
        (!date) ? res.send("Please input some date") : res.send(req.body);
    });

    app.post('/rain-history', async (req: Request, res: Response) => {
        const date = new Date();
        const day = req.body.day;
        const history: any = await queryHandler.rainHistory(date, day);

        res.send(history);
    });

    app.post('/rain-history-calendar', async (req: Request, res: Response) => {
        const date = new Date(req.body.end_day);
        const day = req.body.day;

        try {
            const history: any = await queryHandler.rainHistory(date, day);
            res.send(history);
        } catch (error) {
            res.send(error)
        }
        
    })

    app.listen(port, host, () => {
        console.log(`[server]: Server is running at http://${host}:${port}`);
    });
}

main();







