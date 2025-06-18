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

export interface Player {
    id: string;
    hand: Card[];
    hasPassed: boolean;
    middleCard?: Card[];
}

export interface GameEvent {
    playerId: string;
    action: 'received' | 'played' | 'passed';
    cards?: Card[];
    type?: HandType;
}

export interface GameState {
    players: Player[];
    lastPlayed: {
        playerId: string;
        hand: Card[];
        type: HandType;
    } | null;
    turnOrder: string[];
    turnNumber: Number;
    history: GameEvent[];
    winners: string[];
}

export interface ObfuscatedPlayer {
    id: string;
    name?: string;
    cardsLeft: number;
}

export interface PlayerGameState extends Pick<GameState, 'lastPlayed' | 'turnNumber' | 'turnOrder' | 'history'> {
    id: string;
    hand: Card[];
    opponents: ObfuscatedPlayer[];
}
