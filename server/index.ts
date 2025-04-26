import express, { Application, Request, Response } from "express";
import cors from "cors"
import { WebSocketServer } from "ws";
import uuid from "uuid";

import { errorHandler } from "./utils/error";
import { create as createRoom } from "./services/room";

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


// Websocket Server

const wssPort = 3001;
const wss = new WebSocketServer({ port: wssPort }, () => {
    console.log("Websocket Server Started");
});

const playerData: Record<string, any> = {
    "type": "playerData"
}

wss.on('connection', (client) => {
    const clientId = uuid.v7();
    playerData[clientId] = { id: clientId }
    client.send(`{"id": "${clientId}"}`);

    client.on('message', (data) => {
        var dataJson = JSON.parse(String(data));

        console.log("Player Message:", dataJson);
    })

    client.on('close', () => {
        console.log(`Connection closed for player ${clientId}`);
    });
});

wss.on("listening", () => {
    console.log(`Listening on port ${wssPort}`);
});
