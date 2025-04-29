/**
 * Tests for Question Analysis Routes
 */

const request = require('supertest');
const express = require('express');
const { getCollection } = require('../../src/repository/baseRepository');

// Mock the MongoDB collection and aggregation
jest.mock('../../src/repository/baseRepository', () => ({
  getCollection: jest.fn(),
}));

// Create an Express app for testing
const app = express();
const questionRoutes = require('../../src/routes/questions');
app.use('/api/questions', questionRoutes);

describe('Question Analysis Routes', () => {
  let mockAggregate;
  let mockToArray;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock data
    const mockAnalysisResult = [
      {
        total: [{ count: 500 }],
        byPosition: [
          { _id: 'Intern', count: 120 },
          { _id: 'Junior', count: 90 },
          { _id: 'Unknown', count: 10 },
        ],
        byLanguage: [
          { _id: 'PHP', count: 250 },
          { _id: 'Python', count: 80 },
        ],
        byDifficulty: [
          { _id: 'easy', count: 300 },
          { _id: 'medium', count: 150 },
          { _id: 'hard', count: 30 },
          { _id: 'Unknown', count: 20 },
        ],
        byCategory: [
          { _id: 'PHP Basics', count: 120 },
          { _id: 'OOP', count: 100 },
        ],
        byTopic: [
          { _id: 'Biến và kiểu dữ liệu', count: 80 },
          { _id: 'Class và Object', count: 60 },
        ],
        byDate: [
          { _id: '2025-04-28', count: 10 },
          { _id: '2025-04-27', count: 5 },
        ],
        uniqueLanguages: [{ count: 5 }],
        uniqueCategories: [{ count: 12 }],
        uniquePositions: [{ count: 6 }],
      },
    ];

    // Setup mocks
    mockToArray = jest.fn().mockResolvedValue(mockAnalysisResult);
    mockAggregate = jest.fn().mockReturnValue({ toArray: mockToArray });
    getCollection.mockReturnValue({ aggregate: mockAggregate });
  });

  describe('GET /api/questions/analyze', () => {
    it('should return analysis data when successful', async () => {
      const response = await request(app).get('/api/questions/analyze');

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Question analysis completed successfully.');

      // Verify data structure
      const data = response.body.data;
      expect(data.total).toBe(500);
      expect(data.byPosition).toEqual({ Intern: 120, Junior: 90, Unknown: 10 });
      expect(data.byLanguage).toEqual({ PHP: 250, Python: 80 });
      expect(data.byDifficulty).toEqual({ easy: 300, medium: 150, hard: 30, Unknown: 20 });
      expect(data.byCategory).toEqual({ 'PHP Basics': 120, OOP: 100 });
      expect(data.byTopic).toEqual({ 'Biến và kiểu dữ liệu': 80, 'Class và Object': 60 });
      expect(data.byDate).toEqual({ '2025-04-28': 10, '2025-04-27': 5 });
      expect(data.uniqueLanguages).toBe(5);
      expect(data.uniqueCategories).toBe(12);
      expect(data.averagePerPosition).toBe(83.33);

      // Verify MongoDB aggregation was called correctly
      expect(getCollection).toHaveBeenCalledWith('questions');
      expect(mockAggregate).toHaveBeenCalled();
      expect(mockToArray).toHaveBeenCalled();
    });

    it('should handle errors properly', async () => {
      // Setup error scenario
      mockToArray.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/api/questions/analyze');

      // Verify error response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while analyzing questions.');
      expect(response.body.error).toBe('Database error');
    });

    it('should handle empty collection', async () => {
      // Setup empty result
      mockToArray.mockResolvedValue([
        {
          total: [],
          byPosition: [],
          byLanguage: [],
          byDifficulty: [],
          byCategory: [],
          byTopic: [],
          byDate: [],
          uniqueLanguages: [],
          uniqueCategories: [],
          uniquePositions: [],
        },
      ]);

      const response = await request(app).get('/api/questions/analyze');

      // Verify response with empty data
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      const data = response.body.data;
      expect(data.total).toBe(0);
      expect(data.byPosition).toEqual({});
      expect(data.byLanguage).toEqual({});
      expect(data.byDifficulty).toEqual({});
      expect(data.byCategory).toEqual({});
      expect(data.byTopic).toEqual({});
      expect(data.byDate).toEqual({});
      expect(data.uniqueLanguages).toBe(0);
      expect(data.uniqueCategories).toBe(0);
      expect(data.averagePerPosition).toBe(0);
    });
  });
});
