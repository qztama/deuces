import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType;

export const getClient = async () => {
    if (!redisClient) {
        redisClient = createClient();

        redisClient.on('error', (err) => console.error('Redis Client Error', err));

        await redisClient.connect();
    }

    return redisClient;
}
