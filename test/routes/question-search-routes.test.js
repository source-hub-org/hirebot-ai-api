/**
 * Tests for the question search route
 */

const request = require('supertest');
const { app, initializeApp } = require('../../src/index');
const { ObjectId } = require('mongodb');

// Mock the question search service
jest.mock('../../src/services/questionSearchService', () => {
  return {
    searchQuestions: jest.fn(),
  };
});

// Import the mocked modules
const { searchQuestions } = require('../../src/services/questionSearchService');

describe('Question Search Routes', () => {
  let server;

  beforeAll(async () => {
    // Set environment variables for testing
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'test-model';

    // This might take some time due to MongoDB connection
    jest.setTimeout(10000);
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    // Close the MongoDB connection
    const { closeConnection } = require('../../src/repository/baseRepository');
    await closeConnection();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Mock sample questions for testing
    const mockQuestions = [
      {
        _id: new ObjectId().toString(),
        question: 'What is a closure in JavaScript?',
        options: [
          'A function that returns another function',
          'A variable that cannot be changed',
          'A function with access to its outer scope',
          'A method to close a connection',
        ],
        correctAnswer: 2,
        explanation: 'A closure is a function that has access to variables from its outer scope.',
        difficulty: 'medium',
        category: 'JavaScript Concepts',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
        positionLevel: 3,
        createdAt: new Date('2023-01-01').toISOString(),
      },
      {
        _id: new ObjectId().toString(),
        question: 'What is the difference between let and var in JavaScript?',
        options: [
          'let is block-scoped, var is function-scoped',
          'let cannot be reassigned, var can be',
          'let is only available in ES6, var is in all versions',
          'There is no difference',
        ],
        correctAnswer: 0,
        explanation: 'let is block-scoped while var is function-scoped.',
        difficulty: 'easy',
        category: 'JavaScript Basics',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
        positionLevel: 3,
        createdAt: new Date('2023-01-02').toISOString(),
      },
    ];

    // Default success response for searchQuestions
    searchQuestions.mockResolvedValue({
      questions: mockQuestions,
      pagination: {
        total: 50,
        page: 1,
        page_size: 20,
        total_pages: 3,
      },
    });
  });

  describe('GET /api/questions/search', () => {
    // Test for empty query parameters - should now be valid
    it('should accept empty query parameters', async () => {
      const response = await request(app).get('/api/questions/search').query({
        // No parameters
      });

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with default parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          sort_by: 'random',
          sort_direction: 'desc',
          page: 1,
          page_size: 20,
          mode: 'full',
          ignore_question_ids: [],
        })
      );
    });

    // Test with only topic parameter
    it('should accept only topic parameter', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          sort_by: 'random',
          sort_direction: 'desc',
          page: 1,
          page_size: 20,
        })
      );
    });

    // Test with only language parameter
    it('should accept only language parameter', async () => {
      const response = await request(app).get('/api/questions/search').query({
        language: 'JavaScript',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'JavaScript',
          sort_by: 'random',
          sort_direction: 'desc',
          page: 1,
          page_size: 20,
        })
      );
    });

    // Test with only position parameter
    it('should accept only position parameter', async () => {
      const response = await request(app).get('/api/questions/search').query({
        position: 'junior',
      });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          position: 'junior',
          sort_by: 'random',
          sort_direction: 'desc',
          page: 1,
          page_size: 20,
        })
      );
    });

    // Test for invalid position value
    it('should validate position value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'invalid_position', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain(
        'Position must be one of: intern, fresher, junior, middle, senior, expert'
      );
    });

    // Test for invalid sort_by value
    it('should validate sort_by value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'invalid_field', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain(
        'sort_by must be one of: question, category, createdAt, random'
      );
    });

    // Test for invalid sort_direction value
    it('should validate sort_direction value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_direction: 'invalid_direction', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('sort_direction must be one of: asc, desc');
    });

    // Test for invalid page value
    it('should validate page value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        page: 'not_a_number', // Invalid: not a number
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('page must be a positive integer');
    });

    // Test for invalid page_size value
    it('should validate page_size value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        page_size: -5, // Invalid: negative number
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('page_size must be a positive integer');
    });

    // Test for successful search with default parameters
    it('should search questions successfully with default parameters', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      // Check pagination info
      expect(response.body.pagination).toBeInstanceOf(Object);
      expect(response.body.pagination.total).toBe(50);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.page_size).toBe(20);
      expect(response.body.pagination.total_pages).toBe(3);

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          sort_by: 'random',
          sort_direction: 'desc',
          page: 1,
          page_size: 20,
        })
      );
    });

    // Test for multiple topics
    it('should search questions successfully with multiple topics', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript,React,Node.js',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript,React,Node.js',
          language: 'JavaScript',
          position: 'junior',
        })
      );
    });

    // Test for multiple languages
    it('should search questions successfully with multiple languages', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript,TypeScript,Python',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript,TypeScript,Python',
          position: 'junior',
        })
      );
    });

    // Test for multiple positions
    it('should search questions successfully with multiple positions', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior,middle,senior',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior,middle,senior',
        })
      );
    });

    // Test for successful search with custom parameters
    it('should search questions successfully with custom parameters', async () => {
      // Mock custom pagination response
      searchQuestions.mockResolvedValueOnce({
        questions: [
          /* mock questions */
        ],
        pagination: {
          total: 50,
          page: 2,
          page_size: 10,
          total_pages: 5,
        },
      });

      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'question',
        sort_direction: 'asc',
        page: 2,
        page_size: 10,
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Check pagination info
      expect(response.body.pagination).toBeInstanceOf(Object);
      expect(response.body.pagination.total).toBe(50);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.page_size).toBe(10);
      expect(response.body.pagination.total_pages).toBe(5);

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          sort_by: 'question',
          sort_direction: 'asc',
          page: 2,
          page_size: 10,
        })
      );
    });

    // Test for database error handling
    it('should handle database errors', async () => {
      // Mock a database error
      searchQuestions.mockRejectedValue(new Error('Database connection error'));

      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the error response
      expect(response.status).toBe(500);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while searching for questions.');
      expect(response.body.error).toBe('Database connection error');
    });

    // Test for invalid mode value
    it('should validate mode value', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        mode: 'invalid_mode', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('mode must be one of: compact, full, minimalist');
    });

    // Test for full mode
    it('should search questions successfully with full mode', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        mode: 'full',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          mode: 'full',
        })
      );
    });

    // Test for compact mode
    it('should search questions successfully with compact mode', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        mode: 'compact',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          mode: 'compact',
        })
      );
    });

    // Test for minimalist mode
    it('should search questions successfully with minimalist mode', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        mode: 'minimalist',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          mode: 'minimalist',
        })
      );
    });

    // Test for random sorting
    it('should search questions successfully with random sorting', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'random',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          sort_by: 'random',
          sort_direction: 'desc',
        })
      );
    });

    // Test for random sorting with pagination
    it('should handle random sorting with pagination correctly', async () => {
      // Mock implementation for random sorting with pagination
      searchQuestions.mockImplementation(params => {
        const { page, page_size } = params;

        // Create mock questions for pagination test
        const mockQuestions = Array(5)
          .fill(null)
          .map((_, i) => ({
            _id: new ObjectId(),
            question: `Random question ${i + 1}`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
          }));

        return {
          questions: mockQuestions,
          pagination: {
            total: 20, // Total of 20 questions
            page: parseInt(page),
            page_size: parseInt(page_size),
            total_pages: Math.ceil(20 / parseInt(page_size)),
          },
        };
      });

      // Test first page
      const response1 = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'random',
        page: 1,
        page_size: 5,
      });

      expect(response1.status).toBe(200);
      expect(response1.body.data.length).toBe(5);
      expect(response1.body.pagination.page).toBe(1);
      expect(response1.body.pagination.total_pages).toBe(4);

      // Test second page
      const response2 = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        sort_by: 'random',
        page: 2,
        page_size: 5,
      });

      expect(response2.status).toBe(200);
      expect(response2.body.data.length).toBe(5);
      expect(response2.body.pagination.page).toBe(2);

      // The questions on page 1 and page 2 should be different due to random sorting
      // but we can't test this directly since our mock always returns the same data
      // In a real scenario, the random sorting algorithm would handle this
    });

    // Test for ignore_question_ids parameter
    it('should search questions successfully with ignore_question_ids parameter', async () => {
      const response = await request(app).get('/api/questions/search').query({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'junior',
        ignore_question_ids: '5f9d88b3e5daad3f349c2e2d,5f9d88b3e5daad3f349c2e2e',
      });

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');

      // Verify the mock was called with correct parameters
      expect(searchQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript',
          language: 'JavaScript',
          position: 'junior',
          ignore_question_ids: ['5f9d88b3e5daad3f349c2e2d', '5f9d88b3e5daad3f349c2e2e'],
        })
      );
    });
  });
});
