import { WebSocketServer } from 'ws';
import { v7 as uuidv7 } from 'uuid';
import { Server as HttpServer } from 'http';

import { WSContext } from './types';
import { handleMessage } from './handlers/index';
import { handleLeaveRoom, handleDisconnectRoom } from './handlers/roomHandlers';
import { getPrintFriendlyWSContext } from './utils';

export function initWebsocketServer(server: HttpServer) {
    const wss = new WebSocketServer({ server }, () => {
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

        client.on('close', async () => {
            try {
                console.log('CLOSED', getPrintFriendlyWSContext(ctx));
                if (ctx.roomCode) {
                    console.log(`Connection closed for player ${ctx.clientId}`);

                    if (ctx.isGameStarted && !ctx.isGameOver) {
                        await handleDisconnectRoom(ctx);
                    } else {
                        await handleLeaveRoom(ctx);
                    }
                }
            } catch (err) {
                console.error('Error closing connection', err);
            }
        });
    });
}
