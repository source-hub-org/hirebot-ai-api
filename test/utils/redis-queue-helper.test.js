/**
 * Tests for the Redis queue helper module
 * @module test/redisQueueHelperTest
 */

const {
  addToQueue,
  getFromQueue,
  getAllQueueItems,
  removeFromQueueById,
  clearQueue,
  getQueueLength,
  DEFAULT_QUEUE,
} = require('../../src/utils/redisQueueHelper');

// Mock the Redis client
jest.mock('../../src/services/redisService', () => ({
  getRedisClient: jest.fn(() => {
    const RedisMock = require('ioredis-mock');
    return new RedisMock();
  }),
  initializeRedis: jest.fn(),
  closeRedisConnection: jest.fn(),
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

describe('Redis Queue Helper Tests', () => {
  // Sample queue items for testing
  const sampleQueueItem1 = {
    _id: '507f1f77bcf86cd799439011',
    type: 'question-request',
    payload: { topic_id: 'topic1', limit: 10 },
  };

  const sampleQueueItem2 = {
    _id: '507f1f77bcf86cd799439022',
    type: 'question-request',
    payload: { topic_id: 'topic2', limit: 5 },
  };

  // Clear the queue before each test
  beforeEach(async () => {
    await clearQueue(DEFAULT_QUEUE);
  });

  describe('addToQueue', () => {
    test('should add an item to the queue', async () => {
      const length = await addToQueue(sampleQueueItem1);

      expect(length).toBe(1);

      // Verify the item was added
      const items = await getAllQueueItems();
      expect(items.length).toBe(1);
      expect(items[0]._id).toBe(sampleQueueItem1._id);
    });

    test('should add multiple items to the queue', async () => {
      await addToQueue(sampleQueueItem1);
      const length = await addToQueue(sampleQueueItem2);

      expect(length).toBe(2);

      // Verify both items were added
      const items = await getAllQueueItems();
      expect(items.length).toBe(2);
      expect(items[0]._id).toBe(sampleQueueItem1._id);
      expect(items[1]._id).toBe(sampleQueueItem2._id);
    });
  });

  describe('getFromQueue', () => {
    beforeEach(async () => {
      // Add items to the queue before each test
      await addToQueue(sampleQueueItem1);
      await addToQueue(sampleQueueItem2);
    });

    test('should get and remove an item from the queue (FIFO)', async () => {
      const item = await getFromQueue();

      expect(item).toBeDefined();
      expect(item._id).toBe(sampleQueueItem1._id);

      // Verify the item was removed
      const queueLength = await getQueueLength();
      expect(queueLength).toBe(1);
    });

    test('should get an item without removing it when remove=false', async () => {
      const item = await getFromQueue(DEFAULT_QUEUE, false);

      expect(item).toBeDefined();
      expect(item._id).toBe(sampleQueueItem1._id);

      // Verify the item was not removed
      const queueLength = await getQueueLength();
      expect(queueLength).toBe(2);
    });

    test('should return null when queue is empty', async () => {
      await clearQueue();
      const item = await getFromQueue();

      expect(item).toBeNull();
    });
  });

  describe('getAllQueueItems', () => {
    test('should get all items from the queue without removing them', async () => {
      await addToQueue(sampleQueueItem1);
      await addToQueue(sampleQueueItem2);

      const items = await getAllQueueItems();

      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(2);
      expect(items[0]._id).toBe(sampleQueueItem1._id);
      expect(items[1]._id).toBe(sampleQueueItem2._id);

      // Verify items were not removed
      const queueLength = await getQueueLength();
      expect(queueLength).toBe(2);
    });

    test('should return empty array when queue is empty', async () => {
      const items = await getAllQueueItems();

      expect(items).toBeDefined();
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });
  });

  describe('removeFromQueueById', () => {
    beforeEach(async () => {
      // Add items to the queue before each test
      await addToQueue(sampleQueueItem1);
      await addToQueue(sampleQueueItem2);
    });

    test('should remove a specific item by ID', async () => {
      const removedCount = await removeFromQueueById(sampleQueueItem1._id);

      expect(removedCount).toBe(1);

      // Verify the correct item was removed
      const items = await getAllQueueItems();
      expect(items.length).toBe(1);
      expect(items[0]._id).toBe(sampleQueueItem2._id);
    });

    test('should return 0 when item with ID does not exist', async () => {
      const removedCount = await removeFromQueueById('non-existent-id');

      expect(removedCount).toBe(0);

      // Verify no items were removed
      const queueLength = await getQueueLength();
      expect(queueLength).toBe(2);
    });
  });

  describe('clearQueue', () => {
    beforeEach(async () => {
      // Add items to the queue before each test
      await addToQueue(sampleQueueItem1);
      await addToQueue(sampleQueueItem2);
    });

    test('should clear all items from the queue', async () => {
      const result = await clearQueue();

      expect(result).toBe(true);

      // Verify the queue is empty
      const queueLength = await getQueueLength();
      expect(queueLength).toBe(0);
    });
  });

  describe('getQueueLength', () => {
    test('should return the correct queue length', async () => {
      expect(await getQueueLength()).toBe(0);

      await addToQueue(sampleQueueItem1);
      expect(await getQueueLength()).toBe(1);

      await addToQueue(sampleQueueItem2);
      expect(await getQueueLength()).toBe(2);

      await getFromQueue();
      expect(await getQueueLength()).toBe(1);

      await clearQueue();
      expect(await getQueueLength()).toBe(0);
    });
  });
});
