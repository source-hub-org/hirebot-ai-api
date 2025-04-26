/**
 * Redis Service Module
 * @module service/redisService
 */

const Redis = require('ioredis');
const logger = require('../utils/logger');

/**
 * Redis client instance
 * @type {Redis|null}
 */
let redisClient = null;

/**
 * Initialize Redis connection
 * @async
 * @param {Object} [options={}] - Redis connection options
 * @param {string} [options.host='localhost'] - Redis host
 * @param {number} [options.port=6379] - Redis port
 * @param {string} [options.password] - Redis password
 * @returns {Promise<Redis>} Redis client instance
 * @throws {Error} If connection fails
 */
async function initializeRedis(options = {}) {
  try {
    const host = options.host || process.env.REDIS_HOST || 'localhost';
    const port = options.port || process.env.REDIS_PORT || 6379;
    const password = options.password || process.env.REDIS_PASSWORD;

    const redisOptions = {
      host,
      port,
      retryStrategy: times => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    };

    if (password) {
      redisOptions.password = password;
    }

    if (!redisClient) {
      redisClient = new Redis(redisOptions);

      redisClient.on('connect', () => {
        logger.info(`Connected to Redis at ${host}:${port}`);
      });

      redisClient.on('error', err => {
        logger.error('Redis connection error:', err);
      });
    }

    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    throw error;
  }
}

/**
 * Get the Redis client instance
 * @returns {Redis} Redis client instance
 * @throws {Error} If Redis is not initialized
 */
function getRedisClient() {
  if (!redisClient) {
    throw new Error('Redis client not initialized. Call initializeRedis() first.');
  }
  return redisClient;
}

/**
 * Close the Redis connection
 * @async
 * @returns {Promise<void>}
 */
async function closeRedisConnection() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis connection closed');
  }
}

module.exports = {
  initializeRedis,
  getRedisClient,
  closeRedisConnection,
};
