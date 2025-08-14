import { generateOrderedDeck, generateShuffledDeck, dealCards, determineTurnOrder, checkMoveValidity } from '../utils';
import { RANKS, SUITS } from '../constants';
import { Card, Player, GameState } from '../types';

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
                avatar: 'ASTRO',
                name: 'Player 1',
                hand: ['5S', '6H'],
                hasPassed: false,
            },
            {
                id: 'player2',
                avatar: 'ASTRO',
                name: 'Player 2',
                hand: ['3D', '9C'],
                hasPassed: false,
            },
            {
                id: 'player3',
                avatar: 'ASTRO',
                name: 'Player 3',
                hand: ['7H', '8S'],
                hasPassed: false,
            },
        ];

        const turnOrder = determineTurnOrder(players);

        expect(turnOrder.map(({ id }) => id)).toEqual(['player2', 'player3', 'player1']);
    });
});

describe('checkMoveValidity', () => {
    const basePlayers: Player[] = [
        { id: 'p1', name: 'A', avatar: 'ASTRO', hand: ['3D', '4D'], hasPassed: false },
        { id: 'p2', name: 'B', avatar: 'GORILLA', hand: ['5D', '6D'], hasPassed: false },
        { id: 'p3', name: 'C', avatar: 'MOUSE', hand: ['7D', '8D'], hasPassed: false },
    ];

    function getBaseGameState(overrides = {}) {
        return {
            players: JSON.parse(JSON.stringify(basePlayers)),
            inPlay: null,
            turnNumber: 0,
            history: [],
            winners: [],
            ...overrides,
        } as GameState;
    }

    it('should allow valid first move with 3D', () => {
        const gameState = getBaseGameState();
        const result = checkMoveValidity(gameState, 'p1', ['3D']);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBe('');
    });

    it('should allow a valid move for another player after the first round', () => {
        const gameState = getBaseGameState({ inPlay: { playerId: 'p1', hand: ['4D'], type: 'single' }, turnNumber: 2 });
        const result = checkMoveValidity(gameState, 'p3', ['7D']);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBe('');
    });

    it('should allow a valid move that is bigger than in play after the first round', () => {
        const gameState = getBaseGameState({ inPlay: { playerId: 'p2', hand: ['5D'], type: 'single' }, turnNumber: 1 });
        const result = checkMoveValidity(gameState, 'p2', ['6D']);
        expect(result.isValid).toBe(true);
        expect(result.errorMessage).toBe('');
    });

    it('should reject first move without 3D', () => {
        const gameState = getBaseGameState();
        const result = checkMoveValidity(gameState, 'p1', ['4D']);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/3 of diamonds/);
    });

    it('should reject move if not player turn', () => {
        const gameState = getBaseGameState();
        const result = checkMoveValidity(gameState, 'p2', ['5D']);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/not the your turn/);
    });

    it('should reject move if player does not have the cards', () => {
        const gameState = getBaseGameState();
        const result = checkMoveValidity(gameState, 'p1', ['5D']);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/do not have the cards/);
    });

    it('should reject pass on new round after first move', () => {
        const gameState = getBaseGameState({ turnNumber: 1, inPlay: null });
        const result = checkMoveValidity(gameState, 'p2', []);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/cannot pass at a start of a new round/);
    });

    it('should reject invalid hand type', () => {
        const gameState = getBaseGameState({ inPlay: { playerId: 'p2', hand: ['5D'], type: 'single' }, turnNumber: 1 });
        const result = checkMoveValidity(gameState, 'p2', ['5D', '6D']);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/not a valid hand/);
    });

    it('should reject move not bigger than in play', () => {
        const gameState = getBaseGameState({ inPlay: { playerId: 'p3', hand: ['7D'], type: 'single' }, turnNumber: 3 });
        const result = checkMoveValidity(gameState, 'p1', ['4D']);
        expect(result.isValid).toBe(false);
        expect(result.errorMessage).toMatch(/must be bigger/);
    });
});
