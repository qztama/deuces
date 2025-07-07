import { WSMessageJoin, WSMessageSetReady, WSMessageRoomUpdated } from '@deuces/shared';
import * as redisService from '../../services/redis';
import { unsubscribeToGame } from '../../services/game/index';
import {
    Room,
    getRoomRedisKey,
    join as joinRoom,
    leave as leaveRoom,
    subscribeToRoomInfo,
    unsubscribeToRoomInfo,
    updateClientReadyState,
} from '../../services/room.js';
import { WSContext } from '../types.js';
import { getPrintFriendlyWSContext } from '../utils.js';

export async function handleJoinRoom(ctx: WSContext, joinMessage: WSMessageJoin) {
    const { ws } = ctx;
    const { payload } = joinMessage;
    const redisClient = redisService.getClient();

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

    const room = await joinRoom(payload.roomCode, ctx.clientId, payload.name);
    const roomRedisKey = getRoomRedisKey(payload.roomCode);
    await redisClient.set(roomRedisKey, JSON.stringify(room));
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

    await updateClientReadyState({ clientId, roomCode, isReady });
}

export function handleLeaveRoom(ctx: WSContext) {
    if (!ctx.roomCode) {
        console.error('No roomCode provided for leaving room.', getPrintFriendlyWSContext(ctx));
        return;
    }

    unsubscribeToGame(ctx, ctx.roomCode);
    unsubscribeToRoomInfo(ctx, ctx.roomCode);

    leaveRoom(ctx.roomCode, ctx.clientId);
}
