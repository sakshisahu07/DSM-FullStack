import IORedis from 'ioredis';
import logger from "../utils/logger.js";

let redisAvailable = false;

const redisClient = new IORedis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    maxRetriesPerRequest: null,
    keepAlive: 10000,
    password: process.env.REDIS_PASSWORD || undefined,
    retryStrategy(times) {
        if (times > 3) {
            // Stop retrying after 3 attempts
            return null;
        }
        return Math.min(times * 500, 2000);
    },
    lazyConnect: true,
});

['get', 'set', 'setex', 'del', 'keys', 'unlink'].forEach(method => {
    if (typeof redisClient[method] === 'function') {
        const original = redisClient[method].bind(redisClient);
        redisClient[method] = async (...args) => {
            if (!redisAvailable) return null;
            try {
                return await original(...args);
            } catch (err) {
                return null;
            }
        };
    }
});

// node-redis uses camelCase (setEx), ioredis uses lowercase (setex)
// alias for backward compatibility with existing service code
redisClient.setEx = redisClient.setex;

redisClient.on('connect', () => {
    redisAvailable = true;
    logger.info('Redis client connected');
});

redisClient.on('error', (err) => {
    redisAvailable = false;
    // Log only once, not every retry
});

redisClient.on('end', () => {
    redisAvailable = false;
});

// connectRedis now actively tries to connect (lazyConnect mode)
export const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        logger.warn('⚠️  Redis not available. Caching will be skipped.');
    }
};

export const clearHomeCache = async () => {
    try {
        const keys = await redisClient.keys("home:data:*");
        if (keys && keys.length > 0) {
            await redisClient.del(keys);
        }
    } catch (err) {
        // ignore offline redis or execution errors
    }
};

export { redisAvailable };
export default redisClient;
