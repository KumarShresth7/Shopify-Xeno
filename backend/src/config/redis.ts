import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const isSecure = REDIS_URL.startsWith('rediss://');

export const redisConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    ...(isSecure ? {
        tls: {
            rejectUnauthorized: false
        }
    } : {})
});
redisConnection.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisConnection.on('connect', () => {
    console.log(`Redis connected successfully (Secure: ${isSecure})`);
});