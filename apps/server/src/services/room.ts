import { RedisClientType } from 'redis';

import { HttpError } from '../utils/error';
import { WSContext } from '../wss/types';
import * as redisService from './redis';

export interface Room {
    code: string;
    connectedClients: {
        id: string;
        name: string;
        isHost: boolean;
        isReady: boolean;
        status: 'connected' | 'disconnected';
    }[];
    isGameStarted: boolean;
    isGameOver: boolean;
}

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
        throw new HttpError(404, 'Room not found.');
    }

    return JSON.parse(roomData) as Room;
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

export async function join(roomCode: string, clientId: string, name?: string): Promise<Room> {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);

    const room: Room = await getRoomInfo(redisClient, roomRedisKey);
    const matchedClientIdx = room.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx !== -1) {
        if (room.connectedClients[matchedClientIdx].status === 'connected') {
            throw new HttpError(400, 'User is already connected.');
        }

        room.connectedClients[matchedClientIdx].status = 'connected';
        return room;
    }

    if (room.connectedClients.length >= 3) {
        throw new HttpError(400, 'Room is already full.');
    }

    room.connectedClients.push({
        id: clientId,
        name: name ?? `Player ${room.connectedClients.length + 1}`,
        isHost: room.connectedClients.length === 0,
        isReady: false,
        status: 'connected',
    });

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
}) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const roomInfo: Room = await getRoomInfo(redisClient, roomRedisKey);
    if (!roomInfo) {
        throw new Error(`Could not find room ${roomCode}.`);
    }

    const ownConnectedClient = roomInfo.connectedClients.find((cc) => cc.id === clientId);
    if (!ownConnectedClient) {
        throw new Error(`Could not find client ${clientId} in connected clients for room ${roomInfo.code}`);
    }

    ownConnectedClient.isReady = isReady;
    await redisClient.set(roomRedisKey, JSON.stringify(roomInfo));
}

export async function leave(roomCode: string, clientId: string) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const room = await getRoomInfo(redisClient, roomRedisKey);

    const matchedClientIdx = room.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx === -1) {
        console.warn(`Could not find connected client ${clientId}.`);
    }

    room.connectedClients.splice(matchedClientIdx, 1);
    if (!room.connectedClients[0].isHost) {
        // re-assign host if the host left
        room.connectedClients[0].isHost = true;
    }
    await redisClient.set(roomRedisKey, JSON.stringify(room));
}

export async function disconnect(roomCode: string, clientId: string) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const room = await getRoomInfo(redisClient, roomRedisKey);

    const matchedClientIdx = room.connectedClients.findIndex((c) => c.id === clientId);

    if (matchedClientIdx === -1) {
        throw new HttpError(404, `Could not find connected client ${clientId}.`);
    }

    room.connectedClients[matchedClientIdx].status = 'disconnected';
    await redisClient.set(roomRedisKey, JSON.stringify(room));

    console.log('disconnected');
}

export function subscribeToRoomInfo(ctx: WSContext, roomCode: string, cb: (roomInfo: Room) => void) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    redisService.subscribe(ctx, roomRedisKey, async () => {
        const roomInfo = await getRoomInfo(redisClient, roomRedisKey);
        cb(roomInfo);
    });
}

export function unsubscribeToRoomInfo(ctx: WSContext, roomCode: string) {
    const roomRedisKey = getRoomRedisKey(roomCode);
    redisService.unsubscribe(ctx, roomRedisKey);
}
