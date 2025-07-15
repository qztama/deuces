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

export function getHandScore(handType: HandType, move: Card[]): number {
    let handScore = 0;

    const handTypeMultiplier = HAND_TYPES.findIndex((ht) => ht === handType);
    handScore += handTypeMultiplier * 1000;

    const handRep = getHandRep(handType, move);
    handScore += getCardScore(handRep);
    return handScore;
}
