import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { v7 as uuidv7 } from 'uuid';

import {
    WSMessageBase,
    WSMessageConnected,
    WSMessageJoin,
    WSMessageJoined,
    WSMessageRoomUpdated,
} from '../shared/wsMessages';
import { initRedis } from './services/redis';
import { errorHandler } from './utils/error';
import {
    Room,
    create as createRoom,
    join as joinRoom,
    disconnect as disconnectRoom,
    subscribeToRoomInfo,
} from './services/room';

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

(async () => {
    // Redis Server
    await initRedis();

    // WebSocket Server
    const wssPort = 3001;
    const wss = new WebSocketServer({ port: wssPort }, () => {
        console.log('Websocket Server Started');
    });

    wss.on('connection', (client) => {
        let connectionInfo: ConnectionInfo;

        client.send(
            JSON.stringify({
                type: 'connected',
            })
        );

        client.on('message', async (data) => {
            var message = JSON.parse(String(data)) as WSMessageBase;

            console.log('Player Message:', message);
            try {
                switch (message.type) {
                    case 'join': {
                        connectionInfo = await handleJoinRoom(
                            client,
                            message as WSMessageJoin
                        );
                    }
                }
            } catch (err) {
                console.error(
                    `Error on message with type: ${message.type}`,
                    err
                );
            }
        });

        client.on('close', () => {
            try {
                if (connectionInfo) {
                    console.log(
                        `Connection closed for player ${connectionInfo.clientId}`
                    );
                    disconnectRoom(
                        connectionInfo.roomCode,
                        connectionInfo.clientId
                    );
                }
            } catch (err) {
                console.error('Error closing connection', err);
            }
        });
    });

    wss.on('listening', () => {
        console.log(`Listening on port ${wssPort}`);
    });
})();

// Websocket Server

interface ConnectionInfo {
    clientId: string;
    roomCode: string;
}

async function handleJoinRoom(
    ws: WebSocket,
    joinMessage: WSMessageJoin
): Promise<ConnectionInfo> {
    const { payload } = joinMessage;
    let clientId = uuidv7();

    // user rejoined; update their clientId to their previous clientId
    if (payload.clientId) {
        clientId = payload.clientId;
    }

    const roomInfo = await joinRoom(payload.roomCode, clientId, payload.name);
    const response: WSMessageJoined = {
        type: 'joined',
        payload: {
            clientId,
            room: roomInfo,
        },
    };
    ws.send(JSON.stringify(response));

    subscribeToRoomInfo(payload.roomCode, (roomInfo: Room) => {
        const response: WSMessageRoomUpdated = {
            type: 'room-updated',
            payload: {
                room: roomInfo,
            },
        };
        ws.send(JSON.stringify(response));
    });

    return {
        clientId,
        roomCode: roomInfo.code,
    };
}

async function handleWSMessage(
    ws: WebSocket,
    connectionInfo: ConnectionInfo,
    dataJson: Record<string, any>
) {
    switch (dataJson.type) {
        case 'join': {
            const data = dataJson as WSMessageJoin;

            // user rejoined; update their clientId to their previous clientId
            if (data.payload.clientId) {
                connectionInfo.clientId = data.payload.clientId;
            }

            const roomInfo = await joinRoom(
                data.payload.roomCode,
                connectionInfo.clientId,
                data.payload.name
            );

            const response: WSMessageJoined = {
                type: 'joined',
                payload: {
                    clientId: connectionInfo.clientId,
                    room: roomInfo,
                },
            };

            ws.send(JSON.stringify(response));
        }
        default: {
            console.log('Unknown message');
        }
    }
}
