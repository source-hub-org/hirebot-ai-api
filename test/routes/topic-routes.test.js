/**
 * Tests for the topic routes module
 * @module test/topicRoutesTest
 */

const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { initializeDb, closeConnection } = require('../../src/repository/baseRepository');
const { getAllTopics } = require('../../src/repository/topicRepository');
const topicRoutes = require('../../src/routes/topicRoutes');

// Mock dependencies
jest.mock('../../src/repository/topicRepository');

describe('Topic Routes Tests', () => {
  let app;
  let mongoServer;
  let mongoUri;

  // Sample topics for testing
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

  // Set up Express app and MongoDB before all tests
  beforeAll(async () => {
    // Set up Express app
    app = express();
    app.use(express.json());
    app.use('/api/topics', topicRoutes);

    // Set up in-memory MongoDB
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

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/topics', () => {
    test('should return all topics', async () => {
      // Mock repository to return sample topics
      getAllTopics.mockResolvedValue(sampleTopics);

      // Make request
      const response = await request(app).get('/api/topics');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(sampleTopics);
      expect(getAllTopics).toHaveBeenCalled();
    });

    test('should return empty array when no topics exist', async () => {
      // Mock repository to return empty array
      getAllTopics.mockResolvedValue([]);

      // Make request
      const response = await request(app).get('/api/topics');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual([]);
      expect(getAllTopics).toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      // Mock repository to throw error
      getAllTopics.mockRejectedValue(new Error('Database error'));

      // Make request
      const response = await request(app).get('/api/topics');

      // Verify response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Failed to retrieve topics.');
      expect(response.body.error).toBe('Database error');
    });
  });
});
