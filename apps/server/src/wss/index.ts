import { WebSocketServer } from 'ws';
import { v7 as uuidv7 } from 'uuid';

import { WSContext } from './types';
import { disconnect as disconnectRoom } from '../services/room';
import { handleMessage } from './handlers/index';
import { handleLeaveRoom } from './handlers/roomHandlers';
import { getPrintFriendlyWSContext } from './utils';

export function initWebsocketServer(wssPort: number) {
    const wss = new WebSocketServer({ port: wssPort, host: '0.0.0.0' }, () => {
        console.log('Websocket Server Started');
    });

    wss.on('connection', (client) => {
        let ctx: WSContext = {
            ws: client,
            clientId: uuidv7(),
            isGameStarted: false,
            isGameOver: false,
        };

        client.on('message', async (data) => {
            await handleMessage(ctx, String(data));
        });

        client.on('close', () => {
            try {
                console.log('CLOSED', getPrintFriendlyWSContext(ctx));
                if (ctx.roomCode) {
                    console.log(`Connection closed for player ${ctx.clientId}`);

                    if (ctx.isGameStarted && !ctx.isGameOver) {
                        disconnectRoom(ctx.roomCode, ctx.clientId);
                    } else {
                        handleLeaveRoom(ctx);
                    }
                }
            } catch (err) {
                console.error('Error closing connection', err);
            }
        });
    });

    wss.on('listening', () => {
        console.log(`Listening on port ${wssPort}`);
    });
}
