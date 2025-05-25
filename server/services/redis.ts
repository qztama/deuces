import { createClient, RedisClientType } from 'redis';
import { WSContext } from '../ws/types';
import { getPrintFriendlyWSContext } from '../ws/utils';

let redisClient: RedisClientType;
let subscriber: RedisClientType;

const subscriptions = new Map<string, Map<string, () => Promise<void>>>();

export const initRedisClient = async () => {
    if (!redisClient) {
        console.log('Initializing Redis Client...');
        redisClient = createClient();
        redisClient.on('error', (err) =>
            console.error('Redis Client Error', err)
        );
        await redisClient.connect();

        subscriber = redisClient.duplicate();
        subscriber.on('ready', () => console.log('Redis subscriber ready'));
        subscriber.on('error', (err) => console.error('Redis error:', err));
        await subscriber.connect();

        await subscriber.pSubscribe('__keyevent@0__:*', (key, channel) => {
            console.log('🔥 Raw Redis Keyevent:', channel, key);
            const subs = subscriptions.get(key);

            if (!subs) {
                console.warn(`Could not find subscriptions with key ${key}.`);
                return;
            }

            for (let [_clientId, cb] of subs) {
                cb();
            }
        });
    }
};

export const getClient = () => redisClient;

export async function subscribe(
    ctx: WSContext,
    key: string,
    cb: () => Promise<void>
) {
    const subs =
        subscriptions.get(key) ?? new Map<string, () => Promise<void>>();
    subs.set(ctx.clientId, cb);
    subscriptions.set(key, subs);
}

export async function unsubscribe(ctx: WSContext, key: string) {
    const subs = subscriptions.get(key);

    if (!subs) {
        console.error(
            'Could not find subs to unsubscribe.',
            getPrintFriendlyWSContext(ctx),
            key
        );
        return;
    }

    subs.delete(ctx.clientId);
}
