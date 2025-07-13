import { RedisClientType } from 'redis';
import { HttpError } from '../../utils/error';

import * as redisService from '../redis';
import { WSContext } from '../../wss/types';
import { Card, GameState, Player, PlayerGameState } from './types';
import {
    dealCards,
    determineTurnOrder,
    generateShuffledDeck,
    getHandScore,
    getHandType,
    getPlayerGameState,
} from './utils';
import { AvatarOptions } from '@deuces/shared';

// Game Connection
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
export function initGame(clients: { id: string; name: string; avatar: AvatarOptions }[]): GameState {
    if (![3, 4].includes(clients.length)) {
        throw new Error(`Error initializing game: invalid number of players found.`);
    }

    const shuffledCards = generateShuffledDeck();
    const { hands, leftOver } = dealCards(shuffledCards, clients.length as 3 | 4);
    const players = clients.map(({ id, name, avatar }, idx) => {
        const curPlayerHand = hands[idx];
        const hasDiamondThree = curPlayerHand.some((card) => card === '3D');

        const formattedPlayer: Player = {
            id,
            name,
            avatar,
            hand: hasDiamondThree ? curPlayerHand.concat(leftOver) : curPlayerHand,
            hasPassed: false,
            middleCard: hasDiamondThree ? leftOver : undefined,
        };
        return formattedPlayer;
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
export async function validateMove(
    gameState: GameState,
    clientId: string,
    move: Card[]
): Promise<{ isValid: boolean; errorMessage: string }> {
    const { players, turnNumber, inPlay } = gameState;

    // check player turn
    if (clientId !== players[turnNumber % players.length].id) {
        return {
            isValid: false,
            errorMessage: 'It is not the your turn.',
        };
    }

    // check if player has those cards
    const player = players.find(({ id }) => id === clientId);
    if (!player) {
        throw new Error('Could not find client id in the players list.');
    }

    const hasCardsForMove = move.every((card) => player.hand.includes(card));
    if (!hasCardsForMove) {
        return {
            isValid: false,
            errorMessage: 'You do not have the cards to play this move.',
        };
    }

    // check for move validity
    // first move must include a diamond 3
    if (turnNumber === 0 && !move.includes('3D')) {
        return {
            isValid: false,
            errorMessage: 'The first move must include the 3 of diamonds.',
        };
    }

    // if everyone else who is still playing has passed, this can be anything
    // otherwise: verify hand type (is valid and matches with hand in play) and bigger
    const isNewRound = inPlay === null;
    const isPassMove = move.length === 0;

    if (isNewRound && isPassMove) {
        throw new Error(`Error in move validation: ${clientId} cannot pass at a start of a new round`);
    }

    if (!isPassMove) {
        const moveType = getHandType(move);
        if (!moveType) {
            return {
                isValid: false,
                errorMessage: 'This move is not a valid hand.',
            };
        }

        if (!isNewRound) {
            if (inPlay.hand.length !== move.length) {
                return {
                    isValid: false,
                    errorMessage: 'Your move must be the same number of cards as what is in play.',
                };
            }

            const inPlayScore = getHandScore(inPlay.type, inPlay.hand);
            const moveScore = getHandScore(moveType, move);

            if (moveScore <= inPlayScore) {
                return {
                    isValid: false,
                    errorMessage: 'Your move must be bigger than what is in play.',
                };
            }
        }
    }

    return { isValid: true, errorMessage: '' };
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

    // went full circle which means everyone either passed or has no cards
    // turn now begins with the next person that has cards
    while (nextPlayers[nextTurnNumber % totalPlayers].hand.length === 0) {
        nextTurnNumber++;
    }

    return nextTurnNumber;
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
    const nextTurnPlayerIdx = nextTurnNumber % players.length;

    let nextInPlay: GameState['inPlay'] = isPassMove
        ? Object.assign({}, inPlay)
        : {
              playerId: curPlayer.id,
              hand: move,
              type: moveType,
          };
    if (nextTurnNumber - turnNumber >= players.length || players[nextTurnPlayerIdx].id === nextInPlay?.playerId) {
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
                playerId: players[nextTurnPlayerIdx].id,
                action: isPassMove ? 'passed' : 'played',
                cards: isPassMove ? undefined : move,
                type: isPassMove ? undefined : moveType,
            },
        ],
        winners: [...winners, ...(isWinningPlay ? [curPlayer.id] : [])],
    };
}
