import { WSMessage, WSMessageGameUpdated, WSMessageJoin, WSMessagePlayMove } from '../../../shared/wsMessages';
import { WSContext } from '../types';
import { handleConnectToGame, handlePlayMove, handleStartGame } from './gameHandlers';

import { handleJoinRoom, handleLeaveRoom } from './roomHandlers';

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
                handlePlayMove(ctx, playMoveMessage.payload.move);
                break;
            }
        }
    } catch (err) {
        console.error(`Error on message with type: ${message.type}`, err);
    }
}
