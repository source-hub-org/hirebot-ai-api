/**
 * Tests for the question request routes module
 * @module test/questionRequestRoutesTest
 *
 * NOTE: This test file has been deprecated. The question request routes have been
 * merged into the main questionRoutes.js file. Please use the new test file:
 * test/routes/question-routes-request.test.js
 */

const request = require('supertest');
const express = require('express');
const { processQuestionRequest } = require('../../src/service/questionRequestService');
const questionRoutes = require('../../src/routes/questionRoutes');

// Mock dependencies
jest.mock('../../src/service/questionRequestService');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

// Mock other dependencies used by questionRoutes
jest.mock('../../src/service/gemini/quizQuestionCreator');
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/questionSearchValidator');
jest.mock('../../src/service/questionSearchService');

describe('Question Request Routes Tests (Legacy)', () => {
  let app;

  // Sample data for testing
  const sampleJobs = [
    {
      _id: '507f1f77bcf86cd799439011',
      type: 'question-request',
      status: 'new',
      created_at: new Date().toISOString(),
    },
    {
      _id: '507f1f77bcf86cd799439022',
      type: 'question-request',
      status: 'new',
      created_at: new Date().toISOString(),
    },
  ];

  // Set up Express app before all tests
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/questions', questionRoutes);
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    processQuestionRequest.mockResolvedValue(sampleJobs);
  });

  describe('POST /api/questions/request', () => {
    test('should create question request jobs successfully', async () => {
      const response = await request(app)
        .post('/api/questions/request')
        .send({
          topics: ['topic1', 'topic2'],
          limit: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.jobCount).toBe(2);
      expect(response.body.data.jobs).toHaveLength(2);
      expect(processQuestionRequest).toHaveBeenCalledWith({
        topics: ['topic1', 'topic2'],
        limit: 5,
      });
    });

    test('should handle empty topics array', async () => {
      const response = await request(app).post('/api/questions/request').send({
        topics: [],
        limit: 10,
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(processQuestionRequest).toHaveBeenCalledWith({
        topics: [],
        limit: 10,
      });
    });

    test('should validate limit parameter', async () => {
      const response = await request(app)
        .post('/api/questions/request')
        .send({
          topics: ['topic1'],
          limit: -5,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Limit must be a positive integer');
      expect(processQuestionRequest).not.toHaveBeenCalled();
    });

    test('should validate topics parameter', async () => {
      const response = await request(app).post('/api/questions/request').send({
        topics: 'not-an-array',
        limit: 10,
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Topics must be an array');
      expect(processQuestionRequest).not.toHaveBeenCalled();
    });

    test('should handle service errors', async () => {
      processQuestionRequest.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .post('/api/questions/request')
        .send({
          topics: ['topic1'],
          limit: 10,
        });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Failed to process question request');
      expect(response.body.error).toBe('Service error');
    });
  });
});
