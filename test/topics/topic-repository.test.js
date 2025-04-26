/**
 * Tests for the topic repository module
 * @module test/topicRepositoryTest
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const { initializeDb, closeConnection } = require('../../src/repository/baseRepository');
const {
  clearAllTopics,
  insertTopics,
  getAllTopics,
} = require('../../src/repository/topicRepository');

describe('Topic Repository Tests', () => {
  let mongoServer;
  let mongoUri;

  // Sample test topics
  const sampleTopics = [
    {
      title: 'Topic 1',
      difficulty: 1,
      popularity: 'low',
      suitable_level: 'intern',
      description: 'Description 1',
    },
    {
      title: 'Topic 2',
      difficulty: 2,
      popularity: 'high',
      suitable_level: 'junior',
      description: 'Description 2',
    },
  ];

  // Set up in-memory MongoDB server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await initializeDb(mongoUri, 'test_db');
  });

  // Close connections after all tests
  afterAll(async () => {
    await closeConnection();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clean up the topics collection before each test
  beforeEach(async () => {
    await clearAllTopics();
  });

  describe('clearAllTopics', () => {
    test('should clear all topics from the database', async () => {
      // First insert some topics
      await insertTopics(sampleTopics);

      // Verify topics were inserted
      let topics = await getAllTopics();
      expect(topics.length).toBe(2);

      // Clear all topics
      const result = await clearAllTopics();

      // Verify deletion result
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(2);

      // Verify topics were deleted
      topics = await getAllTopics();
      expect(topics.length).toBe(0);
    });

    test('should not fail when collection is empty', async () => {
      // Clear topics when none exist
      const result = await clearAllTopics();

      // Verify deletion result
      expect(result.acknowledged).toBe(true);
      expect(result.deletedCount).toBe(0);
    });
  });

  describe('insertTopics', () => {
    test('should insert multiple topics into the database', async () => {
      // Insert topics
      const result = await insertTopics(sampleTopics);

      // Verify insertion result
      expect(result.acknowledged).toBe(true);
      expect(result.insertedCount).toBe(2);

      // Verify topics were inserted
      const topics = await getAllTopics();
      expect(topics.length).toBe(2);
      expect(topics[0].title).toBe('Topic 1');
      expect(topics[1].title).toBe('Topic 2');
    });

    test('should insert an empty array without error', async () => {
      // Insert empty array
      const result = await insertTopics([]);

      // Verify insertion result
      expect(result.acknowledged).toBe(true);
      expect(result.insertedCount).toBe(0);
    });
  });

  describe('getAllTopics', () => {
    test('should retrieve all topics from the database', async () => {
      // Insert topics
      await insertTopics(sampleTopics);

      // Retrieve topics
      const topics = await getAllTopics();

      // Verify retrieved topics
      expect(topics.length).toBe(2);
      expect(topics[0].title).toBe('Topic 1');
      expect(topics[0].difficulty).toBe(1);
      expect(topics[0].popularity).toBe('low');
      expect(topics[0].suitable_level).toBe('intern');
      expect(topics[0].description).toBe('Description 1');

      expect(topics[1].title).toBe('Topic 2');
      expect(topics[1].difficulty).toBe(2);
      expect(topics[1].popularity).toBe('high');
      expect(topics[1].suitable_level).toBe('junior');
      expect(topics[1].description).toBe('Description 2');
    });

    test('should return an empty array when no topics exist', async () => {
      // Retrieve topics when none exist
      const topics = await getAllTopics();

      // Verify empty array is returned
      expect(Array.isArray(topics)).toBe(true);
      expect(topics.length).toBe(0);
    });
  });
});
