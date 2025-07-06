import { Room, Card, PlayerGameState } from './game.js';

export interface WSMessageBase {
    type: string;
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

export interface WSMessageSetReady extends WSMessageBase {
    type: 'set-ready';
    payload: {
        isReady: boolean;
    };
}

export interface WSMessageRoomUpdated extends WSMessageBase {
    type: 'room-updated';
    payload: {
        clientId: string;
        room: Room;
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

// Error
export const WS_ERR_TYPES = {
    GENERIC: 'Internal Server Error',
    INVALID_MOVE: 'Invalid Move',
} as const;

export interface WSMessageError extends WSMessageBase {
    type: 'error';
    payload: {
        type: (typeof WS_ERR_TYPES)[keyof typeof WS_ERR_TYPES];
        message: string;
    };
}

export type WSMessage =
    | WSMessageConnected
    | WSMessageJoin
    | WSMessageSetReady
    | WSMessageRoomUpdated
    | WSMessageLeave
    | WSMessageStartGame
    | WSMessageConnectToGame
    | WSMessageGameUpdated
    | WSMessagePlayMove
    | WSMessageError;

type MessageMap<T extends { type: string }> = {
    [M in T as M['type']]: M;
};

export type WSMessageMap = MessageMap<WSMessage>;
