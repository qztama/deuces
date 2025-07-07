import { HandType, Rank, Suit } from './types';

export const RANKS: Rank[] = ['3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A', '2'] as const;
export const SUITS: Suit[] = ['D', 'C', 'H', 'S'] as const;
export const HAND_TYPES: HandType[] = [
    'single',
    'pair',
    'triple',
    'quad',
    'straight',
    'flush',
    'fullhouse',
    'fourplusone',
    'straightflush',
];

export const HAND_TYPE_MULTIPLER = 1000;
export const RANK_MULTIPLER = 10;
