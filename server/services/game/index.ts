import { RedisClientType } from 'redis';
import { HttpError } from '../../utils/error';

import * as redisService from '../redis';
import { WSContext } from '../../ws/types';
import { GameState, Player, PlayerGameState } from './types';
import { dealCards, determineTurnOrder, generateShuffledDeck, getPlayerGameState } from './utils';

// Game Connection
export function getGameRedisKey(roomCode: string) {
    return `game:${roomCode}`;
}

async function getGameState(redisClient: RedisClientType, gameRedisKey: string): Promise<GameState> {
    const gameStateData = await redisClient.get(gameRedisKey);

    if (!gameStateData) {
        throw new HttpError(404, 'Room not found.');
    }

    return JSON.parse(gameStateData) as GameState;
}

export function subscribeToGame(ctx: WSContext, roomCode: string, cb: (playerGameState: PlayerGameState) => void) {
    const redisClient = redisService.getClient();
    const gameRedisKey = getGameRedisKey(roomCode);

    redisService.subscribe(ctx, gameRedisKey, async () => {
        const gameState = await getGameState(redisClient, gameRedisKey);
        const playerGameState = getPlayerGameState(ctx.clientId, gameState);
        cb(playerGameState);
    });
}

export function unsubscribeToGame(ctx: WSContext, roomCode: string) {
    const gameRedisKey = getGameRedisKey(roomCode);
    redisService.unsubscribe(ctx, gameRedisKey);
}

// Gameplay
export function initGame(clients: { id: string; name: string }[]): GameState {
    if (![3, 4].includes(clients.length)) {
        throw new Error(`Error initializing game: invalid number of players found.`);
    }

    const shuffledCards = generateShuffledDeck();
    const { hands, leftOver } = dealCards(shuffledCards, clients.length as 3 | 4);
    const players = clients.map(({ id }, idx) => {
        const curPlayerHand = hands[idx];
        const hasDiamondThree = curPlayerHand.some((card) => card === '3D');

        return {
            id,
            hand: hasDiamondThree ? curPlayerHand.concat(leftOver) : curPlayerHand,
            hasPassed: false,
            middleCard: hasDiamondThree ? leftOver : undefined,
        } as Player;
    });
    const turnOrder = determineTurnOrder(players);

    return {
        players,
        lastPlayed: null,
        turnOrder,
        turnNumber: 0,
        history: [
            {
                playerId: turnOrder[0],
                action: 'received',
                cards: leftOver,
            },
        ],
        winners: [],
    };
}
