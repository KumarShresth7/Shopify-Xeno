import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Check if the URL indicates a secure connection
const isSecure = REDIS_URL.startsWith('rediss://');

export const redisConnection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
    // Add TLS options if using a secure connection
    ...(isSecure ? {
        tls: {
            rejectUnauthorized: false // Often needed for self-signed certs on cloud providers
        }
    } : {})
});

console.log(`Redis connection initialized (Secure: ${isSecure})`);