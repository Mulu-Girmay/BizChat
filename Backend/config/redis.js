const Redis = require('ioredis');

let redisClient = null;

const connectRedis = () => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    lazyConnect: true,
    retryStrategy: (times) => {
      if (times > 3) {
        console.warn('⚠️  Redis unavailable after 3 retries. Smart Lock will use in-memory fallback.');
        return null; // stop retrying
      }
      return Math.min(times * 200, 1000);
    },
  });

  redisClient.on('connect', () => console.log('✅ Redis Connected'));
  redisClient.on('error', (err) => console.warn(`⚠️  Redis Error: ${err.message}`));

  redisClient.connect().catch(() => {});

  return redisClient;
};

const getRedis = () => redisClient;

module.exports = { connectRedis, getRedis };
