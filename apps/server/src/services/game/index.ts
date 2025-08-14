import * as redisService from '../redis';
import { WSContext } from '../../wss/types';
import { Card, GameState, PlayerGameState } from './types';
import { checkMoveValidity, getNextGameState, getNewGameState, getPlayerGameState } from './utils';
import { AvatarOptions } from '@deuces/shared';

import { getGameStateByRoomCode, saveGameState } from './gameRepository';

export function subscribeToGame(ctx: WSContext, roomCode: string, cb: (playerGameState: PlayerGameState) => void) {
    redisService.subscribeToGame(ctx, roomCode, (gameState) => {
        const playerGameState = getPlayerGameState(ctx.clientId, gameState);
        cb(playerGameState);
    });
}

export function unsubscribeToGame(ctx: WSContext, roomCode: string) {
    redisService.unsubscribeToGame(ctx, roomCode);
}

// Gameplay
export async function initGame(
    roomCode: string,
    clients: { id: string; name: string; avatar: AvatarOptions }[]
): Promise<GameState> {
    if (![3, 4].includes(clients.length)) {
        throw new Error(`Error initializing game: invalid number of players found.`);
    }

    const newGameState = getNewGameState(clients);
    await saveGameState(roomCode, newGameState);
    return newGameState;
}

export async function validateMove(
    roomCode: string,
    clientId: string,
    move: Card[]
): Promise<{ isValid: boolean; errorMessage: string }> {
    const gameState = await getGameStateByRoomCode(roomCode);
    return checkMoveValidity(gameState, clientId, move);
}

export async function progressGameState(roomCode: string, move: Card[]): Promise<GameState> {
    const gameState = await getGameStateByRoomCode(roomCode);
    const nextGameState = getNextGameState(gameState, move);
    await saveGameState(roomCode, nextGameState);
    return nextGameState;
}
