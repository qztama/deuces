import { Rank, Suit, Card, HandType } from '../../../shared/game';

export { Rank, Suit, Card, HandType };

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
    inPlay: {
        playerId: string;
        hand: Card[];
        type: HandType;
    } | null;
    turnNumber: number;
    history: GameEvent[];
    winners: string[];
}

export interface ObfuscatedPlayer {
    id: string;
    name?: string;
    cardsLeft: number;
}

export interface PlayerGameState extends Pick<GameState, 'inPlay' | 'turnNumber' | 'history'> {
    id: string;
    hand: Card[];
    opponents: ObfuscatedPlayer[];
}
