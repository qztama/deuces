import { Card, GameState, ObfuscatedPlayer, PlayerGameState, Player, HandType, Rank, Suit } from './types';
import { RANKS, SUITS, HAND_TYPES, RANK_MULTIPLER } from './constants';

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

// Validation
export function checkForStraight(move: Card[]): { isStraight: boolean; rep: Card | null } {
    if (move.length !== 5) {
        return { isStraight: false, rep: null };
    }

    // Line represents: A 2 3 4 5 6 7 8 9 T J Q K A
    const freqLine = Array.from({ length: 14 }, () => [] as Card[]);

    for (let c of move) {
        const rank = c.charAt(0) as Rank;
        let updateIdx: number[];

        if (rank === 'A') updateIdx = [0, 13];
        else if (rank === 'T') updateIdx = [9];
        else if (rank === 'J') updateIdx = [10];
        else if (rank === 'Q') updateIdx = [11];
        else if (rank === 'K') updateIdx = [12];
        else {
            updateIdx = [Number(rank) - 1];
        }

        for (let idx of updateIdx) {
            freqLine[idx].push(c);
        }
    }

    // Loop through line 5 at a time to check for consecutives
    for (let i = 0; i <= 9; i++) {
        if (freqLine[i].length > 0) {
            let consecutiveCount = 0;

            for (let j = i; j < i + 5 && freqLine[j].length > 0; j++) {
                consecutiveCount++;
            }

            if (consecutiveCount === 5) {
                return { isStraight: true, rep: freqLine[i + 4][0] };
            }
        }
    }

    return { isStraight: false, rep: null };
}

export function getHandType(move: Card[]): HandType | null {
    const rankCounts = new Map<Rank, number>();
    const suitCounts = new Map<Suit, number>();

    for (let c of move) {
        const rank = c.charAt(0) as Rank;
        const suit = c.charAt(1) as Suit;

        const curRankCount = rankCounts.get(rank) ?? 0;
        rankCounts.set(rank, curRankCount + 1);

        const curSuitCount = suitCounts.get(suit) ?? 0;
        suitCounts.set(suit, curSuitCount + 1);
    }

    const sortedRankCounts = Array.from(rankCounts.values()).sort((a, b) => b - a);
    const sortedSuitCounts = Array.from(suitCounts.values()).sort((a, b) => b - a);

    if (move.length === 1) return 'single';
    if (move.length === 2 && sortedRankCounts[0] === 2) return 'pair';
    if (move.length === 3 && sortedRankCounts[0] === 3) return 'triple';
    if (move.length === 4 && sortedRankCounts[0] === 4) return 'quad';

    if (move.length === 5) {
        const { isStraight, rep: straightRepCard } = checkForStraight(move);
        const isFlush = sortedSuitCounts[0] === 5;

        if (isStraight && isFlush) return 'straightflush';
        else if (sortedRankCounts[0] === 4) return 'fourplusone';
        else if (sortedRankCounts[0] === 3 && sortedRankCounts[1] === 2) return 'fullhouse';
        else if (isFlush) return 'flush';
        else if (isStraight) return 'straight';
    }

    return null;
}

function getCardScore(card: Card): number {
    const rank = card.charAt(0);
    const suit = card.charAt(1);
    return RANKS.findIndex((r) => r === rank) * RANK_MULTIPLER + SUITS.findIndex((s) => s === suit);
}

function getHighestRankAmongCards(cards: Card[]) {
    const sortedCards = cards.slice().sort((cardA, cardB) => getCardScore(cardB) - getCardScore(cardA));
    return sortedCards[0];
}

// Assumes that the hand is a valid hand of handType
function getHandRep(handType: HandType, move: Card[]): Card {
    if (['pair', 'triple', 'quad', 'single', 'flush'].includes(handType)) {
        return getHighestRankAmongCards(move);
    }

    if (['fullhouse', 'fourplusone'].includes(handType)) {
        const groupedByRank = new Map();

        for (let c of move) {
            const cardRank = c.charAt(0);

            if (groupedByRank.has(cardRank)) {
                groupedByRank.get(cardRank).push(c);
            } else {
                groupedByRank.set(cardRank, [c]);
            }
        }

        let largestCardGroup: Card[] = [];

        for (let [_, cardGroup] of groupedByRank) {
            if (largestCardGroup.length < cardGroup.length) {
                largestCardGroup = cardGroup;
            }
        }

        return getHighestRankAmongCards(largestCardGroup);
    }

    // straight and straight flush
    const { rep } = checkForStraight(move);
    return rep!;
}

export function getHandScore(handType: HandType, move: Card[]): number {
    let handScore = 0;

    const handTypeMultiplier = HAND_TYPES.findIndex((ht) => ht === handType);
    handScore += handTypeMultiplier * 1000;

    const handRep = getHandRep(handType, move);
    handScore += getCardScore(handRep);
    return handScore;
}
