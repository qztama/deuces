import { createClient, RedisClientType } from 'redis';
import { Room, GameState } from '@deuces/shared';
import { WSContext } from '../wss/types';
import { getPrintFriendlyWSContext } from '../wss/utils';

const GAME_SUB_PREFIX = 'game';
const ROOM_SUB_PREFIX = 'room';

let redisClient: RedisClientType;
let subscriber: RedisClientType;

const roomSubscriptions = new Map<string, Map<string, (room: Room) => void>>();
const gameSubscriptions = new Map<string, Map<string, (gameState: GameState) => void>>();

export const initRedisClient = async (redisUrl: string) => {
    if (!redisClient) {
        console.log('Initializing Redis Client...');
        redisClient = createClient({
            url: redisUrl,
        });
        redisClient.on('error', (err) => console.error('Redis Client Error', err));
        await redisClient.connect();

        subscriber = redisClient.duplicate();
        subscriber.on('ready', () => console.log('Redis subscriber ready'));
        subscriber.on('error', (err) => console.error('Redis error:', err));
        await subscriber.connect();

        await subscriber.pSubscribe(`${ROOM_SUB_PREFIX}:*`, (message, channel) => {
            console.log('Channel:', channel);
            console.log('Message:', message);

            const subs = roomSubscriptions.get(channel);

            if (!subs) {
                console.warn(`Could not find subscriptions with key ${channel}.`);
                return;
            }

            const room = JSON.parse(message) as Room;

            for (let [_clientId, cb] of subs) {
                console.log(`Sending to client ${_clientId}`);
                cb(room);
            }
        });

        await subscriber.pSubscribe(`${GAME_SUB_PREFIX}:*`, (message, channel) => {
            console.log('Channel:', channel);
            console.log('Message:', message);

            const subs = gameSubscriptions.get(channel);

            if (!subs) {
                console.warn(`Could not find subscriptions with key ${channel}.`);
                return;
            }

            const gameState = JSON.parse(message) as GameState;

            for (let [_clientId, cb] of subs) {
                console.log(`Sending to client ${_clientId}`);
                cb(gameState);
            }
        });
    }
};

export const getClient = () => redisClient;

export const getGameSubKey = (roomCode: string) => `${GAME_SUB_PREFIX}:${roomCode}`;
export const getRoomSubKey = (roomCode: string) => `${ROOM_SUB_PREFIX}:${roomCode}`;

export const publishRoomUpdate = async (roomCode: string, roomInfo: Room) => {
    const publisher = getClient();
    const channel = getRoomSubKey(roomCode);
    await publisher.publish(channel, JSON.stringify(roomInfo));
};
export const publishGameUpdate = async (roomCode: string, gameState: GameState) => {
    const publisher = getClient();
    const channel = getGameSubKey(roomCode);
    await publisher.publish(channel, JSON.stringify(gameState));
};

export const subscribeToRoom = (ctx: WSContext, roomCode: string, cb: (room: Room) => void) => {
    const channel = getRoomSubKey(roomCode);
    const subs = roomSubscriptions.get(channel) ?? new Map<string, (room: Room) => void>();
    subs.set(ctx.clientId, cb);
    roomSubscriptions.set(channel, subs);
};
export const subscribeToGame = (ctx: WSContext, roomCode: string, cb: (gameState: GameState) => void) => {
    const channel = getGameSubKey(roomCode);
    const subs = gameSubscriptions.get(channel) ?? new Map<string, (gameState: GameState) => void>();
    subs.set(ctx.clientId, cb);
    gameSubscriptions.set(channel, subs);
};

export async function unsubscribeToRoom(ctx: WSContext, roomCode: string) {
    const channel = getRoomSubKey(roomCode);
    const subs = roomSubscriptions.get(channel);

    if (!subs) {
        console.warn('Could not find subs to unsubscribe.', getPrintFriendlyWSContext(ctx));
        return;
    }

    subs.delete(ctx.clientId);
}
export async function unsubscribeToGame(ctx: WSContext, roomCode: string) {
    const channel = getGameSubKey(roomCode);
    const subs = gameSubscriptions.get(channel);

    if (!subs) {
        console.warn('Could not find game subs to unsubscribe.', getPrintFriendlyWSContext(ctx));
        return;
    }

    subs.delete(ctx.clientId);
}
