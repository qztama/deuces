import { getHandType, checkForStraight, getHandRep, getCardScore } from '@deuces/shared';
import { Card, GameState, ObfuscatedPlayer, PlayerGameState, Player, HandType, Rank, Suit } from './types';
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
        players: gameState.players.reduce((acc, curPlayer) => {
            acc.push({
                id: curPlayer.id,
                name: curPlayer.name,
                cardsLeft: curPlayer.hand.length,
                hasPassed: curPlayer.hasPassed,
                middleCard: curPlayer.middleCard,
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

export function getHandScore(handType: HandType, move: Card[]): number {
    let handScore = 0;

    const handTypeMultiplier = HAND_TYPES.findIndex((ht) => ht === handType);
    handScore += handTypeMultiplier * 1000;

    const handRep = getHandRep(handType, move);
    handScore += getCardScore(handRep);
    return handScore;
}
