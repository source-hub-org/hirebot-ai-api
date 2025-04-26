/**
 * Tests for the Redis service module
 * @module test/redisServiceTest
 */

const Redis = require('ioredis-mock');
const {
  initializeRedis,
  getRedisClient,
  closeRedisConnection,
} = require('../../src/service/redisService');

// Mock ioredis
jest.mock('ioredis', () => require('ioredis-mock'));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

describe('Redis Service Tests', () => {
  afterEach(async () => {
    // Close Redis connection after each test
    await closeRedisConnection();
  });

  describe('initializeRedis', () => {
    test('should initialize Redis client with default options', async () => {
      const client = await initializeRedis();

      expect(client).toBeDefined();
      expect(client instanceof Redis).toBe(true);
    });

    test('should initialize Redis client with custom options', async () => {
      const options = {
        host: 'custom-host',
        port: 1234,
        password: 'secret',
      };

      const client = await initializeRedis(options);

      expect(client).toBeDefined();
      expect(client instanceof Redis).toBe(true);

      // Note: In a real test with actual Redis, we would verify the connection options,
      // but with ioredis-mock this is not possible in the same way
    });

    test('should reuse existing Redis client on subsequent calls', async () => {
      const client1 = await initializeRedis();
      const client2 = await initializeRedis();

      expect(client1).toBe(client2);
    });
  });

  describe('getRedisClient', () => {
    test('should return initialized Redis client', async () => {
      // Initialize Redis first
      await initializeRedis();

      // Get the client
      const client = getRedisClient();

      expect(client).toBeDefined();
      expect(client instanceof Redis).toBe(true);
    });

    test('should throw error if Redis client is not initialized', async () => {
      // Make sure Redis is not initialized
      await closeRedisConnection();

      // Attempt to get the client
      expect(() => getRedisClient()).toThrow('Redis client not initialized');
    });
  });

  describe('closeRedisConnection', () => {
    test('should close Redis connection', async () => {
      // Initialize Redis first
      await initializeRedis();

      // Close the connection
      await closeRedisConnection();

      // Verify client is closed by checking that getRedisClient throws
      expect(() => getRedisClient()).toThrow('Redis client not initialized');
    });

    test('should handle closing when no connection exists', async () => {
      // Make sure Redis is not initialized
      await closeRedisConnection();

      // Close again (should not throw)
      await expect(closeRedisConnection()).resolves.not.toThrow();
    });
  });
});
