import * as redisService from './redis';

import { HttpError } from '../utils/error';
import { RedisClientType } from 'redis';
import { WSContext } from '../ws/types';

export interface Room {
    code: string;
    connectedClients: {
        id: string;
        name: string;
        isHost: boolean;
        status: 'connected' | 'disconnected';
    }[];
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

function getRoomRedisKey(roomCode: string) {
    return `room:${roomCode}`;
}

async function getRoomInfo(
    redisClient: RedisClientType,
    roomRedisKey: string
): Promise<Room> {
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
    };

    redisClient.set(roomRedisKey, JSON.stringify(roomData));

    return roomCode;
}

export async function join(
    roomCode: string,
    clientId: string,
    name?: string
): Promise<Room> {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);

    const room: Room = await getRoomInfo(redisClient, roomRedisKey);
    const matchedClientIdx = room.connectedClients.findIndex(
        (c) => c.id === clientId
    );

    if (matchedClientIdx !== -1) {
        if (room.connectedClients[matchedClientIdx].status === 'connected') {
            throw new HttpError(400, 'User is already connected.');
        }

        room.connectedClients[matchedClientIdx].status = 'connected';
        await redisClient.set(roomRedisKey, JSON.stringify(room));
        return room;
    }

    if (room.connectedClients.length >= 3) {
        throw new HttpError(400, 'Room is already full.');
    }

    room.connectedClients.push({
        id: clientId,
        name: name ?? `Player ${room.connectedClients.length + 1}`,
        isHost: room.connectedClients.length === 0,
        status: 'connected',
    });

    await redisClient.set(roomRedisKey, JSON.stringify(room));

    return room;
}

export async function leave(roomCode: string, clientId: string) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const room = await getRoomInfo(redisClient, roomRedisKey);

    const matchedClientIdx = room.connectedClients.findIndex(
        (c) => c.id === clientId
    );

    if (matchedClientIdx === -1) {
        console.warn(`Could not find connected client ${clientId}.`);
    }

    room.connectedClients.splice(matchedClientIdx, 1);
    await redisClient.set(roomRedisKey, JSON.stringify(room));
}

export async function disconnect(roomCode: string, clientId: string) {
    const redisClient = redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const room = await getRoomInfo(redisClient, roomRedisKey);

    const matchedClientIdx = room.connectedClients.findIndex(
        (c) => c.id === clientId
    );

    if (matchedClientIdx === -1) {
        throw new HttpError(
            404,
            `Could not find connected client ${clientId}.`
        );
    }

    room.connectedClients[matchedClientIdx].status = 'disconnected';
    await redisClient.set(roomRedisKey, JSON.stringify(room));

    console.log('disconnected');
}

export function subscribeToRoomInfo(
    ctx: WSContext,
    roomCode: string,
    cb: (roomInfo: Room) => void
) {
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
