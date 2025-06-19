import { RedisClientType } from 'redis';
import { HttpError } from '../../utils/error';

import * as redisService from '../redis';
import { WSContext } from '../../ws/types';
import { Card, GameEvent, GameState, HandType, Player, PlayerGameState } from './types';
import {
    dealCards,
    determineTurnOrder,
    generateShuffledDeck,
    getHandScore,
    getHandType,
    getPlayerGameState,
} from './utils';

// Game Connection
export function getGameRedisKey(roomCode: string) {
    return `game:${roomCode}`;
}

export async function getGameState(redisClient: RedisClientType, gameRedisKey: string): Promise<GameState> {
    const gameStateData = await redisClient.get(gameRedisKey);

    if (!gameStateData) {
        throw new HttpError(404, 'Room not found.');
    }

    return JSON.parse(gameStateData) as GameState;
}

export async function getGameStateByRoomCode(roomCode: string) {
    const redisClient = redisService.getClient();
    const gameRedisKey = getGameRedisKey(roomCode);
    return await getGameState(redisClient, gameRedisKey);
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
    const orderedPlayers = determineTurnOrder(players);

    return {
        players: orderedPlayers,
        inPlay: null,
        turnNumber: 0,
        history: [
            {
                playerId: orderedPlayers[0].id,
                action: 'received',
                cards: leftOver,
            },
        ],
        winners: [],
    };
}

// empty array move = pass
export async function validateMove(gameState: GameState, clientId: string, move: Card[]): Promise<boolean> {
    const { players, turnNumber, inPlay } = gameState;

    // check player turn
    if (clientId !== players[turnNumber % players.length].id) {
        throw new Error(`Error in move validation: it is not ${clientId}'s turn`);
    }

    // check if player has those cards
    const player = players.find(({ id }) => id === clientId);
    if (!player) {
        throw new Error(`Error in move validation: ${clientId} is not a player in the game`);
    }

    const hasCardsForMove = move.every((card) => player.hand.includes(card));
    if (!hasCardsForMove) {
        throw new Error(`Error in move validation: ${clientId} does not have the cards for this move`);
    }

    // check for move validity
    // if everyone else who is still playing has passed, this can be anything
    // otherwise: verify hand type (is valid and matches with hand in play) and bigger
    const isNewRound = inPlay === null;
    const isPassMove = move.length === 0;

    if (isNewRound && isPassMove) {
        throw new Error(`Error in move validation: ${clientId} cannot pass at a start of a new round`);
    }

    const moveType = getHandType(move);
    if (!moveType) {
        throw new Error(`Error in move validation: could not determine hand type for ${JSON.stringify(move)}`);
    }

    if (!isNewRound) {
        if (inPlay.hand.length !== move.length) {
            throw new Error(
                `Error in move validation: ${JSON.stringify(move)} cannot be played on top of ${JSON.stringify(
                    inPlay.hand
                )}`
            );
        }

        const inPlayScore = getHandScore(inPlay.type, inPlay.hand);
        const moveScore = getHandScore(moveType, move);

        if (moveScore <= inPlayScore) {
            throw new Error(
                `Error in move validation: ${JSON.stringify(move)} must be bigger than ${JSON.stringify(inPlay.hand)}`
            );
        }
    }

    return true;
}

function getNextTurnNumber(curTurnNumber: number, nextPlayers: Player[]): number {
    const totalPlayers = nextPlayers.length;
    let nextTurnNumber = curTurnNumber + 1;

    for (let i = 0; i < totalPlayers; i++) {
        const playerIndex = nextTurnNumber % totalPlayers;
        const player = nextPlayers[playerIndex];

        if (!player.hasPassed && player.hand.length > 0) {
            return nextTurnNumber;
        }

        nextTurnNumber++;
    }

    return -1; // TODO: revisit what to do with this when game ends
}

export function getNextGameState(curGameState: GameState, move: Card[]): GameState {
    const { players, turnNumber, inPlay, history, winners } = curGameState;
    const curPlayer = players[turnNumber % players.length];

    const moveType = getHandType(move)!;
    const isPassMove = move.length === 0;
    const isWinningPlay = curPlayer.hand.length === move.length;

    const nextPlayers = players.map((p) => {
        const nextPlayerState = Object.assign({}, p);

        if (p.id === curPlayer.id) {
            if (isPassMove) {
                nextPlayerState.hasPassed = true;
            } else {
                nextPlayerState.hand = p.hand.filter((c) => !move.includes(c));
            }
        }

        return nextPlayerState;
    });
    const nextTurnNumber = getNextTurnNumber(turnNumber, nextPlayers);

    let nextInPlay: GameState['inPlay'] = isPassMove
        ? Object.assign({}, inPlay)
        : {
              playerId: curPlayer.id,
              hand: move,
              type: moveType,
          };
    if (players[nextTurnNumber].id === inPlay?.playerId) {
        // everyone else passed so we start a new round
        nextInPlay = null;
        nextPlayers.forEach((p) => {
            p.hasPassed = false;
        });
    }

    return {
        players: nextPlayers,
        inPlay: nextInPlay,
        turnNumber: nextTurnNumber,
        history: [
            ...history,
            {
                playerId: players[turnNumber].id,
                action: isPassMove ? 'passed' : 'played',
                cards: isPassMove ? undefined : move,
                type: isPassMove ? undefined : moveType,
            },
        ],
        winners: [...winners, ...(isWinningPlay ? [curPlayer.id] : [])],
    };
}
