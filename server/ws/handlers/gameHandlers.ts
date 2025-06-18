import { getGameRedisKey, initGame } from '../../services/game';
import * as redisService from '../../services/redis';
import { getRoomInfo, getRoomRedisKey } from '../../services/room';
import { WSContext } from '../types';

export async function handleStartGame(ctx: WSContext) {
    const { roomCode } = ctx;
    const redisClient = redisService.getClient();

    if (!roomCode) {
        throw new Error(`Error starting game: could not find roomCode for client ${ctx.clientId}`);
    }

    const redisRoomKey = getRoomRedisKey(roomCode);
    const { connectedClients } = await getRoomInfo(redisClient, redisRoomKey);
    const hostClient = connectedClients.find(({ isHost }) => isHost);

    if (hostClient?.id !== ctx.clientId) {
        throw new Error(`Error starting game: client ${ctx.clientId} is not the host!`);
    }

    const gameRedisKey = getGameRedisKey(roomCode);
    const gameState = initGame(connectedClients.map(({ id, name }) => ({ id, name })));

    // update redis with the game state to trigger player subscription callbacks
    redisClient.set(gameRedisKey, JSON.stringify(gameState));
}
