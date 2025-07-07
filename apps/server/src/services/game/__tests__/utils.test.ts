import { generateOrderedDeck, generateShuffledDeck, dealCards, determineTurnOrder } from '../utils';
import { RANKS, SUITS } from '../constants';
import { Card, Player } from '../types';

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
