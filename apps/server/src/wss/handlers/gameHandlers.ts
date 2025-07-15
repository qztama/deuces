import { WSMessageGameUpdated, PlayerGameState, Card } from '@deuces/shared';
import {
    getGameRedisKey,
    getGameState,
    getNextGameState,
    initGame,
    validateMove,
    subscribeToGame,
    getGameStateByRoomCode,
    saveGameState,
} from '../../services/game/index.js';
import * as redisService from '../../services/redis.js';
import { getRoomInfoByRoomCode, saveRoomInfo } from '../../services/room.js';
import { WSContext } from '../types.js';
import { getPlayerGameState } from '../../services/game/utils.js';

export async function handleStartGame(ctx: WSContext) {
    const { roomCode } = ctx;

    if (!roomCode) {
        throw new Error(`Error starting game: could not find roomCode for client ${ctx.clientId}`);
    }

    const roomInfo = await getRoomInfoByRoomCode(roomCode);
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

    // consume player ready's, store the game, and notify players that the game is ready
    const updatedRoomInfo = {
        ...{
            ...roomInfo,
            connectedClients: roomInfo.connectedClients.map((cc) => {
                return { ...cc, isReady: false };
            }),
        },
        isGameStarted: true,
        isGameOver: false,
    };
    const newGameState = await initGame(
        roomCode,
        roomInfo.connectedClients.map(({ id, name, avatar }) => ({ id, name, avatar }))
    );
    await saveRoomInfo(roomCode, updatedRoomInfo);

    redisService.publishRoomUpdate(roomCode, updatedRoomInfo);
    redisService.publishGameUpdate(roomCode, newGameState);
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

        await saveGameState(roomCode, nextGameState);

        if (isGameOver) {
            const roomInfo = await getRoomInfoByRoomCode(roomCode);
            const updatedRoomInfo = { ...roomInfo, isGameOver: true };
            await saveRoomInfo(roomCode, updatedRoomInfo);

            await redisService.publishGameUpdate(roomCode, nextGameState);
            await redisService.publishRoomUpdate(roomCode, updatedRoomInfo);
        } else {
            await redisService.publishGameUpdate(roomCode, nextGameState);
        }

        return null;
    }

    return invalidMessage;
}
