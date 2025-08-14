import { RedisClientType } from 'redis';
import { HttpError } from '../../utils/error';
import * as redisService from '../redis';
import { GameState } from './types';

export function getGameRedisKey(roomCode: string) {
    return `game:${roomCode}`;
}

export async function getGameState(redisClient: RedisClientType, gameRedisKey: string): Promise<GameState> {
    const gameStateData = await redisClient.get(gameRedisKey);

    if (!gameStateData) {
        throw new HttpError(404, 'Game not found.');
    }

    return JSON.parse(gameStateData) as GameState;
}

export async function getGameStateByRoomCode(roomCode: string) {
    const redisClient = redisService.getClient();
    const gameRedisKey = getGameRedisKey(roomCode);
    return await getGameState(redisClient, gameRedisKey);
}

export async function saveGameState(roomCode: string, gameState: GameState) {
    const redisClient = redisService.getClient();
    const gameRedisKey = getGameRedisKey(roomCode);
    await redisClient.set(gameRedisKey, JSON.stringify(gameState));
}
