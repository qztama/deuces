import { checkForStraight, getHandType } from '../handUtils';

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
