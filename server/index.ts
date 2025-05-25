import express, { Application, Request, Response } from 'express';
import cors from 'cors';

import { initRedisClient } from './services/redis';
import { errorHandler } from './utils/error';
import { create as createRoom } from './services/room';
import { initWebsocketServer } from './ws';

const WSS_PORT = 3001;

// HTTP Server

const app: Application = express();
const port = 3000;

app.use(errorHandler);
app.use(cors());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

app.get('/create', async (req: Request, res: Response) => {
    try {
        const roomCode = await createRoom();
        res.status(200).json({ roomCode });
    } catch (err) {
        res.status(500).json(err);
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

async function startServers() {
    await initRedisClient();
    initWebsocketServer(WSS_PORT);
}

startServers();
