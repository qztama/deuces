import {
    generateOrderedDeck,
    generateShuffledDeck,
    dealCards,
    determineTurnOrder,
    checkForStraight,
    getHandType,
} from '../utils.js';
import { RANKS, SUITS } from '../constants.js';
import { Card, Player } from '../types.js';

describe('generateShuffledDeck', () => {
    it('should return 52 cards', () => {
        const deck = generateShuffledDeck();
        expect(deck).toHaveLength(52);
    });

    it('should contain all unique cards', () => {
        const deck = generateShuffledDeck();
        const uniqueCards = new Set(deck);
        expect(uniqueCards.size).toBe(52);
    });

    it('should contain all valid cards', () => {
        const validCards = new Set(RANKS.flatMap((rank) => SUITS.map((suit) => `${rank}${suit}` as Card)));

        const deck = generateShuffledDeck();
        deck.forEach((card) => {
            expect(validCards.has(card)).toBe(true);
        });
    });

    it('should produce a shuffled order', () => {
        const original = generateOrderedDeck();
        const shuffled = generateShuffledDeck();

        // It's possible they match, but very unlikely — so allow a rare false negative.
        const isSame = original.every((card, i) => card === shuffled[i]);
        expect(isSame).toBe(false);
    });
});

describe('passCards', () => {
    it('distributes all cards evenly when divisible by players', () => {
        const deck = generateOrderedDeck(); // 52 cards, 4 players
        const { hands, leftOver } = dealCards(deck, 4);

        expect(hands).toHaveLength(4);
        hands.forEach((hand) => expect(hand).toHaveLength(13));
        expect(leftOver).toHaveLength(0);
    });

    it('distributes cards round-robin', () => {
        const deck: Card[] = ['AS', '2S', '3S', '4S', '5S', '6S'];
        const { hands } = dealCards(deck, 3);

        expect(hands[0]).toEqual(['AS', '4S']);
        expect(hands[1]).toEqual(['2S', '5S']);
        expect(hands[2]).toEqual(['3S', '6S']);
    });

    it('handles leftover cards correctly when not divisible', () => {
        const deck = generateOrderedDeck(); // 14 cards, 4 players → 2 leftovers
        const { hands, leftOver } = dealCards(deck, 3);

        expect(hands).toHaveLength(3);
        const totalDealt = hands.reduce((sum, hand) => sum + hand.length, 0);
        expect(totalDealt).toBe(51);
        expect(leftOver).toEqual([deck[deck.length - 1]]);
    });

    it('ensures no cards are lost or duplicated', () => {
        const deck = generateOrderedDeck();
        const { hands, leftOver } = dealCards(deck, 3);

        const allCards = hands.flat().concat(leftOver);
        const uniqueCards = new Set(allCards);
        expect(uniqueCards.size).toBe(deck.length);
    });
});

describe('determineTurnOrder', () => {
    it('should start with the player who has 3D and continue in order', () => {
        const players: Player[] = [
            {
                id: 'player1',
                name: 'Player 1',
                hand: ['5S', '6H'],
                hasPassed: false,
            },
            {
                id: 'player2',
                name: 'Player 2',
                hand: ['3D', '9C'],
                hasPassed: false,
            },
            {
                id: 'player3',
                name: 'Player 3',
                hand: ['7H', '8S'],
                hasPassed: false,
            },
        ];

        const turnOrder = determineTurnOrder(players);

        expect(turnOrder.map(({ id }) => id)).toEqual(['player2', 'player3', 'player1']);
    });
});

describe('checkForStraight', () => {
    it('returns false if the hand is not 5 cards', () => {
        expect(checkForStraight(['3D', '4D', '5D']).isStraight).toBe(false);
        expect(checkForStraight(['3D']).isStraight).toBe(false);
        expect(checkForStraight([]).isStraight).toBe(false);
        expect(checkForStraight(['3D', '4D', '5D', '6D', '7D', '8D']).isStraight).toBe(false);
    });

    it('detects a standard low straight', () => {
        expect(checkForStraight(['3D', '4H', '5S', '6C', '7D'])).toStrictEqual({
            isStraight: true,
            rep: '7D',
        });
    });

    it('detects TJQKA as a valid straight', () => {
        expect(checkForStraight(['TD', 'JD', 'QD', 'KD', 'AD'])).toStrictEqual({
            isStraight: true,
            rep: 'AD',
        });
    });

    it('detects A2345 as a valid straight', () => {
        expect(checkForStraight(['AD', '2C', '3S', '4H', '5D'])).toStrictEqual({
            isStraight: true,
            rep: '5D',
        });
    });

    it('returns false for JQKA2', () => {
        expect(checkForStraight(['JD', 'QC', 'KS', 'AD', '2D']).isStraight).toBe(false);
    });

    it('returns false for non-consecutive cards', () => {
        expect(checkForStraight(['3D', '4D', '6D', '7D', '8D'])).toStrictEqual({
            isStraight: false,
            rep: null,
        });
    });

    it('handles duplicate ranks gracefully (should still be false)', () => {
        expect(checkForStraight(['3D', '3H', '4S', '5C', '6D']).isStraight).toBe(false);
    });
});

describe('getHandType', () => {
    it('returns "single" for a one-card move', () => {
        expect(getHandType(['3D'])).toBe('single');
    });

    it('returns "pair" for two cards of same rank', () => {
        expect(getHandType(['3D', '3H'])).toBe('pair');
    });

    it('returns null for two cards of different rank', () => {
        expect(getHandType(['3D', '4H'])).toBe(null);
    });

    it('returns "triple" for three of same rank', () => {
        expect(getHandType(['5D', '5C', '5S'])).toBe('triple');
    });

    it('returns "quad" for four of same rank', () => {
        expect(getHandType(['6D', '6C', '6H', '6S'])).toBe('quad');
    });

    it('returns null for four cards not all the same rank', () => {
        expect(getHandType(['6D', '6C', '7H', '6S'])).toBe(null);
    });

    it('returns "straightflush" for 5-card straight and same suit', () => {
        expect(getHandType(['3D', '4D', '5D', '6D', '7D'])).toBe('straightflush');
    });

    it('returns "fourplusone" for 4 of same rank + 1 extra', () => {
        expect(getHandType(['9D', '9H', '9S', '9C', 'KD'])).toBe('fourplusone');
    });

    it('returns "fullhouse" for 3 + 2', () => {
        expect(getHandType(['JD', 'JH', 'JS', '8C', '8D'])).toBe('fullhouse');
    });

    it('returns "flush" for 5 same-suit, not straight', () => {
        expect(getHandType(['2H', '5H', '9H', 'KH', 'JH'])).toBe('flush');
    });

    it('returns "straight" for 5 in sequence, mixed suits', () => {
        expect(getHandType(['7D', '8C', '9H', 'TS', 'JH'])).toBe('straight');
    });

    it('returns null for invalid 5-card hand', () => {
        expect(getHandType(['2D', '3D', '4H', '5S', '7C'])).toBe(null);
    });

    it('returns null for hand length not 1–5', () => {
        expect(getHandType([])).toBe(null);
        expect(getHandType(['3D', '4H', '5S', '6C', '7D', '8D'])).toBe(null);
    });
});
