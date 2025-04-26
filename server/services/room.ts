import * as redisService from "./redis";

import { HttpError } from "../utils/error";

export interface Room {
    code: string
    connectedClients: { id: string, name: string, isHost: boolean }[]
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

function generateRoomCode() {
    let code = '';

    for (let i = 0; i < 6; i++) {
        const randIdx = Math.floor((alphabet.length * Math.random()));
        code += alphabet.charAt(randIdx);
    }

    return code;
}

function getRoomRedisKey(roomCode: string) {
    return `room-${roomCode}`
}

export async function create() {
    const redisClient = await redisService.getClient();

    const roomCode = generateRoomCode();
    const roomRedisKey = getRoomRedisKey(roomCode);
    const isAlreadyExisting = await redisClient.exists(roomRedisKey);

    if (isAlreadyExisting) {
        throw new HttpError(500, "Error creating room code. Duplicate found.");
    }

    const roomData: Room = {
        code: roomCode,
        connectedClients: [],
    }

    redisClient.set(roomRedisKey, JSON.stringify(roomData));

    return roomCode;
}

export async function join(roomCode: string, clientId: string, name?: string) {
    const redisClient = await redisService.getClient();
    const roomRedisKey = getRoomRedisKey(roomCode);

    const roomData = await redisClient.get(roomRedisKey);

    if (!roomData) {
        throw new HttpError(404, "Room not found.");
    }

    const room: Room = JSON.parse(roomData);

    if (room.connectedClients.length >= 3) {
        throw new HttpError(400, "Room is already full.");
    }

    room.connectedClients.push({
        id: clientId,
        name: name ?? "Unknown",
        isHost: room.connectedClients.length === 0,
    });

    console.log("Room", room);

    await redisClient.set(roomRedisKey, JSON.stringify(room));

    return room;
}
