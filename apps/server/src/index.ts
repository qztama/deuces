import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import http from 'http';

import { initRedisClient } from './services/redis';
import { errorHandler } from './utils/error';
import { create as createRoom } from './services/room';
import { initWebsocketServer } from './wss/index';

const PORT = parseInt(process.env.PORT || '3000', 10);
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const allowedOrigins = [process.env.FRONTEND_URL || ''];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:5173');
}

// HTTP Server

const app: Application = express();

app.use(errorHandler);
app.use(
    cors({
        origin: function (origin, callback) {
            // allow requests with no origin (like curl)
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            } else {
                return callback(new Error('Not allowed by CORS'));
            }
        },
    })
);

app.get('/create', async (req: Request, res: Response) => {
    try {
        const roomCode = await createRoom();
        res.status(200).json({ roomCode });
    } catch (err) {
        res.status(500).json(err);
    }
});

const server = http.createServer(app);

async function start() {
    await initRedisClient(REDIS_URL);
    initWebsocketServer(server);
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Server listening on port ${PORT}`);
    });
}

start();
