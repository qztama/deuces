import {
    WSMessageBase,
    WSMessageConnected,
    WSMessageJoin,
    WSMessageJoined,
    WSMessageLeave,
    WSMessageRoomUpdated,
} from '../../../shared/wsMessages';

import {
    Room,
    join as joinRoom,
    leave as leaveRoom,
    subscribeToRoomInfo,
    unsubscribeToRoomInfo,
} from '../../services/room';
import { WSContext } from '../types';
import { getPrintFriendlyWSContext } from '../utils';

export async function handleJoinRoom(
    ctx: WSContext,
    joinMessage: WSMessageJoin
) {
    const { ws } = ctx;
    const { payload } = joinMessage;

    // user rejoined; update their clientId to their previous clientId
    if (payload.clientId) {
        ctx.clientId = payload.clientId;
    }

    subscribeToRoomInfo(ctx, payload.roomCode, (roomInfo: Room) => {
        const response: WSMessageRoomUpdated = {
            type: 'room-updated',
            payload: {
                clientId: ctx.clientId,
                room: roomInfo,
            },
        };
        ws.send(JSON.stringify(response));
    });

    await joinRoom(payload.roomCode, ctx.clientId, payload.name);
}

export function handleLeaveRoom(ctx: WSContext) {
    if (!ctx.roomCode) {
        console.error(
            'No roomCode provided for leaving room.',
            getPrintFriendlyWSContext(ctx)
        );
        return;
    }

    unsubscribeToRoomInfo(ctx, ctx.roomCode);

    leaveRoom(ctx.roomCode, ctx.clientId);
}
