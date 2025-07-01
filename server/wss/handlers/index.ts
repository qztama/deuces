import {
    WSMessage,
    WSMessageGameUpdated,
    WSMessageJoin,
    WSMessagePlayMove,
    WS_ERR_TYPES,
    WSMessageError,
    WSMessageSetReady,
} from '../../../shared/wsMessages';
import { WSContext } from '../types';
import { handleConnectToGame, handlePlayMove, handleStartGame } from './gameHandlers';

import { handleJoinRoom, handleSetReady } from './roomHandlers';

export async function handleMessage(ctx: WSContext, data: string) {
    var message = JSON.parse(String(data)) as WSMessage;

    console.log('Player Message:', message);
    try {
        switch (message.type) {
            case 'join': {
                const joinMessage = message as WSMessageJoin;
                ctx.roomCode = joinMessage.payload.roomCode;
                await handleJoinRoom(ctx, joinMessage);
                break;
            }
            case 'set-ready': {
                const setReadyMessage = message as WSMessageSetReady;
                await handleSetReady(ctx, setReadyMessage);
                break;
            }
            case 'start-game': {
                await handleStartGame(ctx);
                break;
            }
            case 'connect-to-game': {
                const playerGameState = await handleConnectToGame(ctx);

                const response: WSMessageGameUpdated = {
                    type: 'game-updated',
                    payload: { gameState: playerGameState },
                };
                ctx.ws.send(JSON.stringify(response));
                break;
            }
            case 'play-move': {
                const playMoveMessage = message as WSMessagePlayMove;
                const invalidMessage = await handlePlayMove(ctx, playMoveMessage.payload.move);

                if (invalidMessage) {
                    const response: WSMessageError = {
                        type: 'error',
                        payload: {
                            type: 'Invalid Move',
                            message: invalidMessage,
                        },
                    };
                    ctx.ws.send(JSON.stringify(response));
                }
                break;
            }
        }
    } catch (err) {
        console.error(`In handleMessage:`, err);

        const message = err instanceof Error ? err.message : 'Something went wrong.';
        const errResponse: WSMessageError = {
            type: 'error',
            payload: {
                type: WS_ERR_TYPES.GENERIC,
                message,
            },
        };

        ctx.ws.send(JSON.stringify(errResponse));
    }
}
