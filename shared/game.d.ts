export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'T' | 'J' | 'Q' | 'K';
export type Suit = 'D' | 'C' | 'H' | 'S';
export type Card = `${Rank}${Suit}`;
export type HandType =
    | 'single'
    | 'pair'
    | 'triple'
    | 'quad'
    | 'straight'
    | 'flush'
    | 'fullhouse'
    | 'fourplusone'
    | 'straightflush';
