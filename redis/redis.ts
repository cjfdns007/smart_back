import * as redis from 'redis';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const redisClient = redis.createClient({
    socket: {
        host: '127.0.0.1',
        port: 6379,
    },
    password: process.env.redisPassword,
});
redisClient.on('connect', () => {
    console.info('Redis connected!');
});
redisClient.on('error', (err) => {
    console.error('Redis Client Error', err);
});
redisClient.connect().then();

export default redisClient;
