/**
 * Redis Queue Helper Functions
 * @module utils/redisQueueHelper
 */

const { getRedisClient } = require('../service/redisService');
const logger = require('./logger');

/**
 * Default queue name
 * @type {string}
 */
const DEFAULT_QUEUE = 'queues';

/**
 * Add a new item to a Redis queue
 * @async
 * @param {Object} item - Item to add to the queue
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @returns {Promise<number>} Length of the queue after adding the item
 * @throws {Error} If adding to queue fails
 */
async function addToQueue(item, queueName = DEFAULT_QUEUE) {
  try {
    const redis = getRedisClient();
    const itemString = JSON.stringify(item);
    const length = await redis.rpush(queueName, itemString);
    logger.info(`Added item to queue '${queueName}'`, { itemId: item._id });
    return length;
  } catch (error) {
    logger.error(`Failed to add item to queue '${queueName}':`, error);
    throw error;
  }
}

/**
 * Get an item from a Redis queue (FIFO)
 * @async
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @param {boolean} [remove=true] - Whether to remove the item from the queue
 * @returns {Promise<Object|null>} Queue item or null if queue is empty
 * @throws {Error} If getting from queue fails
 */
async function getFromQueue(queueName = DEFAULT_QUEUE, remove = true) {
  try {
    const redis = getRedisClient();
    let result;

    if (remove) {
      // LPOP removes and returns the first element
      result = await redis.lpop(queueName);
    } else {
      // LRANGE gets elements without removing them
      const items = await redis.lrange(queueName, 0, 0);
      result = items.length > 0 ? items[0] : null;
    }

    if (!result) {
      return null;
    }

    try {
      const item = JSON.parse(result);
      return item;
    } catch (parseError) {
      logger.error(`Failed to parse queue item from '${queueName}':`, parseError);
      return null;
    }
  } catch (error) {
    logger.error(`Failed to get item from queue '${queueName}':`, error);
    throw error;
  }
}

/**
 * Get all items from a Redis queue without removing them
 * @async
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @returns {Promise<Array<Object>>} Array of queue items
 * @throws {Error} If getting from queue fails
 */
async function getAllQueueItems(queueName = DEFAULT_QUEUE) {
  try {
    const redis = getRedisClient();
    const items = await redis.lrange(queueName, 0, -1);

    return items
      .map(item => {
        try {
          return JSON.parse(item);
        } catch (parseError) {
          logger.error(`Failed to parse queue item from '${queueName}':`, parseError);
          return null;
        }
      })
      .filter(Boolean);
  } catch (error) {
    logger.error(`Failed to get all items from queue '${queueName}':`, error);
    throw error;
  }
}

/**
 * Remove a specific item from a Redis queue by its ID
 * @async
 * @param {string} itemId - ID of the item to remove
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @returns {Promise<number>} Number of items removed
 * @throws {Error} If removing from queue fails
 */
async function removeFromQueueById(itemId, queueName = DEFAULT_QUEUE) {
  try {
    const redis = getRedisClient();
    const items = await redis.lrange(queueName, 0, -1);
    let removedCount = 0;

    for (const item of items) {
      try {
        const parsedItem = JSON.parse(item);
        if (parsedItem._id === itemId) {
          // Remove this specific item (can remove multiple occurrences)
          const removed = await redis.lrem(queueName, 1, item);
          removedCount += removed;
        }
      } catch (parseError) {
        logger.error(`Failed to parse queue item from '${queueName}':`, parseError);
      }
    }

    if (removedCount > 0) {
      logger.info(`Removed ${removedCount} items with ID ${itemId} from queue '${queueName}'`);
    }

    return removedCount;
  } catch (error) {
    logger.error(`Failed to remove item ${itemId} from queue '${queueName}':`, error);
    throw error;
  }
}

/**
 * Clear a Redis queue
 * @async
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @returns {Promise<boolean>} True if queue was cleared successfully
 * @throws {Error} If clearing queue fails
 */
async function clearQueue(queueName = DEFAULT_QUEUE) {
  try {
    const redis = getRedisClient();
    await redis.del(queueName);
    logger.info(`Cleared queue '${queueName}'`);
    return true;
  } catch (error) {
    logger.error(`Failed to clear queue '${queueName}':`, error);
    throw error;
  }
}

/**
 * Get the length of a Redis queue
 * @async
 * @param {string} [queueName=DEFAULT_QUEUE] - Name of the queue
 * @returns {Promise<number>} Length of the queue
 * @throws {Error} If getting queue length fails
 */
async function getQueueLength(queueName = DEFAULT_QUEUE) {
  try {
    const redis = getRedisClient();
    const length = await redis.llen(queueName);
    return length;
  } catch (error) {
    logger.error(`Failed to get length of queue '${queueName}':`, error);
    throw error;
  }
}

module.exports = {
  DEFAULT_QUEUE,
  addToQueue,
  getFromQueue,
  getAllQueueItems,
  removeFromQueueById,
  clearQueue,
  getQueueLength,
};
