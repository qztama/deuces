import { RedisClientType } from 'redis';

import { HttpError } from '../utils/error';
import { WSContext } from '../wss/types';
import * as redisService from './redis';
import { AvatarOptions, Room } from '@deuces/shared';

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function generateRoomCode() {
    let code = '';

    for (let i = 0; i < 6; i++) {
        const randIdx = Math.floor(alphabet.length * Math.random());
        code += alphabet.charAt(randIdx);
    }

    return code;
}

export function getRoomRedisKey(roomCode: string) {
    return `room:${roomCode}`;
}

export async function getRoomInfo(redisClient: RedisClientType, roomRedisKey: string): Promise<Room> {
    const roomData = await redisClient.get(roomRedisKey);

    if (!roomData) {
        throw new Error('No room data found.');
    }

    return JSON.parse(roomData) as Room;
}

export async function getRoomInfoByRoomCode(roomCode: string): Promise<Room> {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    return getRoomInfo(redisClient, roomRedisKey);
}

export async function saveRoomInfo(roomCode: string, roomInfo: Room): Promise<void> {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    await redisClient.set(roomRedisKey, JSON.stringify(roomInfo));
}

export async function create() {
    const redisClient = redisService.getClient();

    const roomCode = generateRoomCode();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const isAlreadyExisting = await redisClient.exists(roomRedisKey);

    if (isAlreadyExisting) {
        throw new HttpError(500, 'Error creating room code. Duplicate found.');
    }

    const roomData: Room = {
        code: roomCode,
        connectedClients: [],
        isGameStarted: false,
        isGameOver: false,
    };

    redisClient.set(roomRedisKey, JSON.stringify(roomData));

    return roomCode;
}

export async function join(roomCode: string, name: string, avatar: AvatarOptions, clientId: string): Promise<Room> {
    const room: Room = await getRoomInfoByRoomCode(roomCode);
    const matchedClientIdx = room.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx !== -1) {
        if (room.connectedClients[matchedClientIdx].status === 'connected') {
            throw new Error('User is already connected.');
        }

        room.connectedClients[matchedClientIdx].status = 'connected';
        await saveRoomInfo(roomCode, room);
        return room;
    }

    if (room.connectedClients.length >= 3) {
        throw new Error('Room is already full.');
    }

    room.connectedClients.push({
        id: clientId,
        name: name,
        avatar: avatar,
        isHost: room.connectedClients.length === 0,
        isReady: false,
        status: 'connected',
    });

    // save the update room info
    await saveRoomInfo(roomCode, room);

    return room;
}

export async function updateClientReadyState({
    clientId,
    roomCode,
    isReady,
}: {
    clientId: string;
    roomCode: string;
    isReady: boolean;
}): Promise<Room> {
    const roomInfo: Room = await getRoomInfoByRoomCode(roomCode);
    if (!roomInfo) {
        throw new Error(`Could not find room ${roomCode}.`);
    }

    const ownConnectedClient = roomInfo.connectedClients.find((cc) => cc.id === clientId);
    if (!ownConnectedClient) {
        throw new Error(`Could not find client ${clientId} in connected clients for room ${roomInfo.code}`);
    }

    ownConnectedClient.isReady = isReady;
    await saveRoomInfo(roomCode, roomInfo);

    return roomInfo;
}

export async function leave(roomCode: string, clientId: string): Promise<Room> {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const room = await getRoomInfo(redisClient, roomRedisKey);

    const matchedClientIdx = room.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx === -1) {
        console.warn(`Could not find connected client ${clientId}.`);
    }

    room.connectedClients.splice(matchedClientIdx, 1);
    if (room.connectedClients.length && !room.connectedClients[0]?.isHost) {
        // re-assign host if the host left
        room.connectedClients[0].isHost = true;
    }
    await redisClient.set(roomRedisKey, JSON.stringify(room));

    return room;
}

export async function disconnect(roomCode: string, clientId: string): Promise<Room> {
    const roomInfo = await getRoomInfoByRoomCode(roomCode);

    const matchedClientIdx = roomInfo.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx === -1) {
        throw new HttpError(404, `Could not find connected client ${clientId}.`);
    }

    roomInfo.connectedClients[matchedClientIdx].status = 'disconnected';
    await saveRoomInfo(roomCode, roomInfo);

    console.log('disconnected');
    return roomInfo;
}

export function subscribeToRoomInfo(ctx: WSContext, roomCode: string, cb: (roomInfo: Room) => void) {
    redisService.subscribeToRoom(ctx, roomCode, (roomInfo) => {
        cb(roomInfo);
    });
}

export function unsubscribeToRoomInfo(ctx: WSContext, roomCode: string) {
    redisService.unsubscribeToRoom(ctx, roomCode);
}
