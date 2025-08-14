import { getHandType, checkForStraight, getHandRep, getCardScore, AvatarOptions } from '@deuces/shared';
import { Card, GameState, ObfuscatedPlayer, PlayerGameState, Player, HandType } from './types';
import { RANKS, SUITS, HAND_TYPES } from './constants';

export { getHandType, checkForStraight };

// Subscription
export function getPlayerGameState(clientId: string, gameState: GameState): PlayerGameState {
    const curPlayer = gameState.players.find((player) => player.id === clientId);

    if (!curPlayer) {
        throw new Error(`Client ${clientId} not found in game state.`);
    }

    return {
        id: clientId,
        hand: curPlayer.hand,
        players: gameState.players.reduce((acc, p) => {
            acc.push({
                id: p.id,
                name: p.name,
                avatar: p.avatar,
                cardsLeft: p.hand.length,
                hasPassed: p.hasPassed,
                middleCard: p.middleCard,
            });
            return acc;
        }, [] as ObfuscatedPlayer[]),
        inPlay: gameState.inPlay,
        turnNumber: gameState.turnNumber,
        history: gameState.history,
        winners: gameState.winners,
    };
}

// Game Setup
export function generateOrderedDeck(): Card[] {
    return RANKS.flatMap((rank) => SUITS.map((suit) => `${rank}${suit}` as Card));
}

export function generateShuffledDeck(): Card[] {
    const newDeck = generateOrderedDeck();

    for (let i = newDeck.length - 1; i >= 0; i--) {
        const swapIdx = Math.floor(Math.random() * i);
        [newDeck[swapIdx], newDeck[i]] = [newDeck[i], newDeck[swapIdx]];
    }

    return newDeck;
}

export function dealCards(deck: Card[], numOfPlayers: 3 | 4 = 3) {
    const hands = Array.from({ length: numOfPlayers }, () => [] as Card[]);
    const cardsToRoundRobin = deck.length - (deck.length % numOfPlayers);

    // pass cards round robin
    for (let i = 0; i < cardsToRoundRobin; i++) {
        hands[i % numOfPlayers].push(deck[i]);
    }

    return {
        hands,
        leftOver: deck.slice(deck.length - (deck.length % numOfPlayers)),
    };
}

export function determineTurnOrder(players: Player[]): Player[] {
    const firstPlayerIdx = players.findIndex(({ hand }) => hand.some((card) => card === '3D'));
    const orderedPlayers = [];

    for (let i = firstPlayerIdx; i < firstPlayerIdx + players.length; i++) {
        orderedPlayers.push(players[i % players.length]);
    }

    return orderedPlayers;
}

export function getNewGameState(clients: { id: string; name: string; avatar: AvatarOptions }[]): GameState {
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

// Game Logic
export function checkMoveValidity(
    gameState: GameState,
    clientId: string,
    move: Card[]
): { isValid: boolean; errorMessage: string } {
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
    const isPassMove = move.length === 0; // empty array move = pass

    if (isNewRound && isPassMove) {
        return {
            isValid: false,
            errorMessage: `Error in move validation: ${clientId} cannot pass at a start of a new round`,
        };
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

export function getNextTurnNumber(curTurnNumber: number, nextPlayers: Player[]): number {
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
                playerId: curPlayer.id,
                action: isPassMove ? 'passed' : 'played',
                cards: isPassMove ? undefined : move,
                type: isPassMove ? undefined : moveType,
            },
        ],
        winners: [...winners, ...(isWinningPlay ? [curPlayer.id] : [])],
    };
}

export function getHandScore(handType: HandType, move: Card[]): number {
    let handScore = 0;

    const handTypeMultiplier = HAND_TYPES.findIndex((ht) => ht === handType);
    handScore += handTypeMultiplier * 1000;

    const handRep = getHandRep(handType, move);
    handScore += getCardScore(handRep);
    return handScore;
}
