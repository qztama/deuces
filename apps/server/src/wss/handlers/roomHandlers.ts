import { WSMessageJoin, WSMessageSetReady, WSMessageRoomUpdated, Room } from '@deuces/shared';
import * as redisService from '../../services/redis';
import { unsubscribeToGame } from '../../services/game/index';
import {
    disconnect,
    join as joinRoom,
    leave as leaveRoom,
    subscribeToRoomInfo,
    unsubscribeToRoomInfo,
    updateClientReadyState,
} from '../../services/room.js';
import { WSContext } from '../types.js';
import { getPrintFriendlyWSContext } from '../utils.js';

export async function handleJoinRoom(ctx: WSContext, joinMessage: WSMessageJoin): Promise<string | null> {
    const { ws } = ctx;
    const { payload } = joinMessage;

    // user rejoined; update their clientId to their previous clientId
    if (payload.clientId) {
        ctx.clientId = payload.clientId;
    }

    subscribeToRoomInfo(ctx, payload.roomCode, (roomInfo: Room) => {
        // update session ctx for player to note that game has started
        ctx.isGameStarted = roomInfo.isGameStarted;
        ctx.isGameOver = roomInfo.isGameOver;

        const response: WSMessageRoomUpdated = {
            type: 'room-updated',
            payload: {
                clientId: ctx.clientId,
                room: roomInfo,
            },
        };
        ws.send(JSON.stringify(response));
    });

    let room;

    try {
        room = await joinRoom(payload.roomCode, payload.name, payload.avatar, ctx.clientId);
    } catch (err) {
        unsubscribeToRoomInfo(ctx, payload.roomCode);

        if (err instanceof Error) {
            return err.message;
        }

        throw err;
    }

    if (room) {
        await redisService.publishRoomUpdate(payload.roomCode, room);
    }
    return null;
}

export async function handleSetReady(ctx: WSContext, message: WSMessageSetReady) {
    const { clientId, roomCode } = ctx;
    const { isReady } = message.payload;

    if (!clientId) {
        throw new Error('Could not find clientId in ctx.');
    }

    if (!roomCode) {
        throw new Error('Could not find roomCode in ctx.');
    }

    const roomInfo = await updateClientReadyState({ clientId, roomCode, isReady });
    await redisService.publishRoomUpdate(roomCode, roomInfo);
}

export async function handleDisconnectRoom(ctx: WSContext) {
    const { roomCode, clientId } = ctx;
    if (!roomCode) {
        console.error('No roomCode provided for disconnecting room.', getPrintFriendlyWSContext(ctx));
        return;
    }

    unsubscribeToGame(ctx, roomCode);
    unsubscribeToRoomInfo(ctx, roomCode);

    const roomInfo = await disconnect(roomCode, ctx.clientId);
    await redisService.publishRoomUpdate(roomCode, roomInfo);
}

export async function handleLeaveRoom(ctx: WSContext) {
    const { roomCode, clientId } = ctx;
    if (!roomCode) {
        console.error('No roomCode provided for leaving room.', getPrintFriendlyWSContext(ctx));
        return;
    }

    unsubscribeToGame(ctx, roomCode);
    unsubscribeToRoomInfo(ctx, roomCode);

    const roomInfo = await leaveRoom(roomCode, clientId);
    await redisService.publishRoomUpdate(roomCode, roomInfo);
}
