import { Card, GameState, ObfuscatedPlayer, PlayerGameState, Player } from './types';
import { RANKS, SUITS } from './constants';

// Subscription
export function getPlayerGameState(clientId: string, gameState: GameState): PlayerGameState {
    const curPlayer = gameState.players.find((player) => player.id === clientId);

    if (!curPlayer) {
        throw new Error(`Client ${clientId} not found in game state.`);
    }

    return {
        id: clientId,
        hand: curPlayer.hand,
        opponents: gameState.players.reduce((acc, curPlayer) => {
            if (curPlayer.id !== clientId) {
                acc.push({
                    id: curPlayer.id,
                    cardsLeft: curPlayer.hand.length,
                });
            }
            return acc;
        }, [] as ObfuscatedPlayer[]),
        lastPlayed: gameState.lastPlayed,
        turnOrder: gameState.turnOrder,
        turnNumber: gameState.turnNumber,
        history: gameState.history,
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

export function determineTurnOrder(players: Player[]): string[] {
    const firstPlayerIdx = players.findIndex(({ hand }) => hand.some((card) => card === '3D'));
    const turnOrder = [];

    for (let i = firstPlayerIdx; i < firstPlayerIdx + players.length; i++) {
        turnOrder.push(players[i % players.length].id);
    }

    return turnOrder;
}
