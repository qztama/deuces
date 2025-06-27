import { Room } from '../server/services/room';
import { PlayerGameState, Card } from '../server/services/game/types';

export interface WSMessageBase {
    type: 'connected' | 'join' | 'joined' | 'room-updated';
    payload?: Record<string, any>;
}

// Room Messages
export interface WSMessageConnected extends WSMessageBase {
    type: 'connected';
}

export interface WSMessageJoin extends WSMessageBase {
    type: 'join';
    payload: {
        roomCode: string;
        clientId?: string;
        name?: string;
    };
}

export interface WSMessageRoomUpdated extends WSMessageBase {
    type: 'room-updated';
    payload: {
        clientId: string;
        room: Room;
        isGameStarted: boolean;
    };
}

export interface WSMessageLeave extends WSMessageBase {
    type: 'leave';
}

// Game Messages
export interface WSMessageStartGame extends WSMessageBase {
    type: 'start-game';
}

export interface WSMessageConnectToGame extends WSMessageBase {
    type: 'connect-to-game';
}

export interface WSMessageGameUpdated extends WSMessageBase {
    type: 'game-updated';
    payload: {
        gameState: PlayerGameState;
    };
}

export interface WSMessagePlayMove extends WSMessageBase {
    type: 'play-move';
    payload: {
        move: Card[];
    };
}

export type WSMessage =
    | WSMessageConnected
    | WSMessageJoin
    | WSMessageRoomUpdated
    | WSMessageLeave
    | WSMessageStartGame
    | WSMessageConnectToGame
    | WSMessageGameUpdated
    | WSMessagePlayMove;

type MessageMap<T extends { type: string }> = {
    [M in T as M['type']]: M;
};

export type WSMessageMap = MessageMap<WSMessage>;
