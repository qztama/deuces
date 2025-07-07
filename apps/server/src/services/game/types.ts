import { Rank, Suit, Card, HandType } from '@deuces/shared';

export { Rank, Suit, Card, HandType };

export interface Player {
    id: string;
    name: string;
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
