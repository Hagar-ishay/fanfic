const { IncrementalCache } = require('@neshca/cache-handler');
const createRedisHandler = require('@neshca/cache-handler/redis-strings').default;
const createLruHandler = require('@neshca/cache-handler/local-lru').default;

IncrementalCache.onCreation(async () => {
  let redisHandler;

  if (process.env.REDIS_URL) {
    try {
      const { createClient } = require('redis');
      const client = createClient({
        url: process.env.REDIS_URL,
      });

      client.on('error', (err) => {
        console.error('Redis Client Error:', err);
      });

      await client.connect();

      redisHandler = createRedisHandler({
        client,
        keyPrefix: 'fanfic:',
        timeoutMs: 1000,
      });
    } catch (error) {
      console.warn('Failed to connect to Redis:', error.message);
    }
  }

  const localHandler = createLruHandler({
    maxItemsNumber: 1000,
    maxItemSizeBytes: 1024 * 1024 * 500, // 500MB
  });

  return {
    handlers: [
      // Use Redis if available, fallback to LRU
      ...(redisHandler ? [redisHandler] : []),
      localHandler,
    ],
  };
});

module.exports = IncrementalCache;