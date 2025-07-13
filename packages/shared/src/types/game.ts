import { AVATAR_OPTIONS } from 'constants';

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
    name: string;
    avatar: AvatarOptions;
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
    inPlay: {
        playerId: string;
        hand: Card[];
        type: HandType;
    } | null;
    turnNumber: number;
    history: GameEvent[];
    winners: string[];
}

export interface ObfuscatedPlayer extends Omit<Player, 'hand'> {
    cardsLeft: number;
}

export interface PlayerGameState extends Pick<GameState, 'inPlay' | 'turnNumber' | 'history' | 'winners'> {
    id: string;
    hand: Card[];
    players: ObfuscatedPlayer[];
}

export type AvatarOptions = (typeof AVATAR_OPTIONS)[number];

export interface Room {
    code: string;
    connectedClients: {
        id: string;
        name: string;
        avatar: AvatarOptions;
        isHost: boolean;
        isReady: boolean;
        status: 'connected' | 'disconnected';
    }[];
    isGameStarted: boolean;
    isGameOver: boolean;
}
