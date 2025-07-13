import { A as AvatarOptions, c as Room, b as PlayerGameState, C as Card, W as WS_ERR_TYPES } from '../constants-Cc9sx8d2.js';
export { G as GameEvent, a as GameState, H as HandType, O as ObfuscatedPlayer, P as Player, R as Rank, S as Suit } from '../constants-Cc9sx8d2.js';

interface WSMessageBase {
    type: string;
    payload?: Record<string, any>;
}
interface WSMessageConnected extends WSMessageBase {
    type: 'connected';
}
interface WSMessageJoin extends WSMessageBase {
    type: 'join';
    payload: {
        roomCode: string;
        clientId?: string;
        name: string;
        avatar: AvatarOptions;
    };
}
interface WSMessageSetReady extends WSMessageBase {
    type: 'set-ready';
    payload: {
        isReady: boolean;
    };
}
interface WSMessageRoomUpdated extends WSMessageBase {
    type: 'room-updated';
    payload: {
        clientId: string;
        room: Room;
    };
}
interface WSMessageLeave extends WSMessageBase {
    type: 'leave';
}
interface WSMessageStartGame extends WSMessageBase {
    type: 'start-game';
}
interface WSMessageConnectToGame extends WSMessageBase {
    type: 'connect-to-game';
}
interface WSMessageGameUpdated extends WSMessageBase {
    type: 'game-updated';
    payload: {
        gameState: PlayerGameState;
    };
}
interface WSMessagePlayMove extends WSMessageBase {
    type: 'play-move';
    payload: {
        move: Card[];
    };
}
interface WSMessageError extends WSMessageBase {
    type: 'error';
    payload: {
        type: (typeof WS_ERR_TYPES)[keyof typeof WS_ERR_TYPES];
        message: string;
    };
}
type WSMessage = WSMessageConnected | WSMessageJoin | WSMessageSetReady | WSMessageRoomUpdated | WSMessageLeave | WSMessageStartGame | WSMessageConnectToGame | WSMessageGameUpdated | WSMessagePlayMove | WSMessageError;
type MessageMap<T extends {
    type: string;
}> = {
    [M in T as M['type']]: M;
};
type WSMessageMap = MessageMap<WSMessage>;

export { AvatarOptions, Card, PlayerGameState, Room, type WSMessage, type WSMessageBase, type WSMessageConnectToGame, type WSMessageConnected, type WSMessageError, type WSMessageGameUpdated, type WSMessageJoin, type WSMessageLeave, type WSMessageMap, type WSMessagePlayMove, type WSMessageRoomUpdated, type WSMessageSetReady, type WSMessageStartGame };
