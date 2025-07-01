import { WSMessageGameUpdated } from '../../../shared/wsMessages';
import { PlayerGameState } from '../../services/game/types';
import {
    getGameRedisKey,
    getGameState,
    getNextGameState,
    initGame,
    validateMove,
    subscribeToGame,
    getGameStateByRoomCode,
} from '../../services/game';
import * as redisService from '../../services/redis';
import { getRoomInfo, getRoomRedisKey } from '../../services/room';
import { Card } from '../../services/game/types';
import { WSContext } from '../types';
import { getPlayerGameState } from '../../services/game/utils';

export async function handleStartGame(ctx: WSContext) {
    const { roomCode } = ctx;
    const redisClient = redisService.getClient();

    if (!roomCode) {
        throw new Error(`Error starting game: could not find roomCode for client ${ctx.clientId}`);
    }

    const redisRoomKey = getRoomRedisKey(roomCode);
    const roomInfo = await getRoomInfo(redisClient, redisRoomKey);
    const totalClients = roomInfo.connectedClients.length;
    const hostClient = roomInfo.connectedClients.find(({ isHost }) => isHost);

    if (totalClients !== 3) {
        throw new Error(`Error starting game: not enough players to start the game!`);
    }

    if (roomInfo.connectedClients.filter((cc) => !cc.isHost && cc.isReady).length !== totalClients - 1) {
        throw new Error('Error starting game: other players are not ready yet!');
    }

    if (hostClient?.id !== ctx.clientId) {
        throw new Error(`Error starting game: client ${ctx.clientId} is not the host!`);
    }

    const gameRedisKey = getGameRedisKey(roomCode);
    const gameState = initGame(roomInfo.connectedClients.map(({ id, name }) => ({ id, name })));

    // store the game and notify players that the game is ready
    await redisClient.set(gameRedisKey, JSON.stringify(gameState));
    await redisClient.set(redisRoomKey, JSON.stringify({ ...roomInfo, isGameStarted: true }));
}

export async function handleConnectToGame(ctx: WSContext): Promise<PlayerGameState> {
    const { ws, roomCode } = ctx;

    if (!roomCode) {
        throw new Error('handleConnectToGame: Could not find roomCode in ctx.');
    }

    subscribeToGame(ctx, roomCode, (playerGameState: PlayerGameState) => {
        const response: WSMessageGameUpdated = {
            type: 'game-updated',
            payload: {
                gameState: playerGameState,
            },
        };
        ws.send(JSON.stringify(response));
    });

    const gameState = await getGameStateByRoomCode(roomCode);
    return getPlayerGameState(ctx.clientId, gameState);
}

export async function handlePlayMove(ctx: WSContext, move: Card[]): Promise<null | string> {
    const { roomCode, clientId } = ctx;

    if (!roomCode) {
        throw new Error(`Could not find roomCode for client ${ctx.clientId}`);
    }

    const redisClient = redisService.getClient();
    const gameRedisKey = getGameRedisKey(roomCode);
    const gameState = await getGameState(redisClient, gameRedisKey);

    // 1. validate move
    const { isValid: isValidMove, errorMessage: invalidMessage } = await validateMove(gameState, clientId, move);

    // 2. update redis with next game state
    if (isValidMove) {
        const nextGameState = getNextGameState(gameState, move);

        const isGameOver = nextGameState.winners.length === nextGameState.players.length - 1;

        await redisClient.set(gameRedisKey, JSON.stringify(nextGameState));

        if (isGameOver) {
            const redisRoomKey = getRoomRedisKey(roomCode);
            const roomInfo = await getRoomInfo(redisClient, redisRoomKey);
            roomInfo.isGameOver = true;

            await redisClient.set(redisRoomKey, JSON.stringify(roomInfo));
        }

        return null;
    }

    return invalidMessage;
}
