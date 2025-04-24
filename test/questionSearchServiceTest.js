/**
 * Tests for the question search service
 */

const { searchQuestions } = require('../src/service/questionSearchService');
const { ObjectId } = require('mongodb');

// Mock the repository module
jest.mock('../src/repository/baseRepository', () => {
  return {
    findMany: jest.fn(),
    getCollection: jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
    }),
  };
});

// Import the mocked modules
const { findMany, getCollection } = require('../src/repository/baseRepository');

describe('Question Search Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Reset the mock for getCollection
    getCollection.mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
    });

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

    // Default success response for findMany
    findMany.mockResolvedValue(mockQuestions);
  });

  it('should search questions with default parameters', async () => {
    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'createdAt',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
    };

    const result = await searchQuestions(searchParams);

    // Verify the result structure
    expect(result).toHaveProperty('questions');
    expect(result).toHaveProperty('pagination');
    expect(result.questions).toBeInstanceOf(Array);
    expect(result.questions.length).toBe(2);

    // Check pagination info
    expect(result.pagination).toBeInstanceOf(Object);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.page_size).toBe(20);
    expect(result.pagination.total_pages).toBe(3);

    // Verify the repository functions were called with correct parameters
    expect(findMany).toHaveBeenCalledWith(
      'questions',
      expect.objectContaining({
        topic: expect.any(Object),
        language: expect.any(Object),
        position: expect.any(Object),
      }),
      expect.objectContaining({
        sort: { createdAt: -1 }, // Default sort
        skip: 0, // First page
        limit: 20, // Default page size
      })
    );

    expect(getCollection).toHaveBeenCalledWith('questions');
    expect(getCollection().countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        topic: expect.any(Object),
        language: expect.any(Object),
        position: expect.any(Object),
      })
    );
  });

  it('should search questions with custom parameters', async () => {
    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'question',
      sort_direction: 'asc',
      page: 2,
      page_size: 10,
    };

    const result = await searchQuestions(searchParams);

    // Verify the repository functions were called with correct parameters
    expect(findMany).toHaveBeenCalledWith(
      'questions',
      expect.objectContaining({
        topic: expect.any(Object),
        language: expect.any(Object),
        position: expect.any(Object),
      }),
      expect.objectContaining({
        sort: { question: 1 }, // Ascending sort by question
        skip: 10, // Second page with page_size 10
        limit: 10, // Custom page size
      })
    );

    // Check pagination info
    expect(result.pagination).toBeInstanceOf(Object);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.page).toBe(2);
    expect(result.pagination.page_size).toBe(10);
    expect(result.pagination.total_pages).toBe(5);
  });

  it('should handle database errors', async () => {
    // Mock a database error
    findMany.mockRejectedValue(new Error('Database connection error'));

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'createdAt',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
    };

    // Expect the service to throw the error
    await expect(searchQuestions(searchParams)).rejects.toThrow('Database connection error');
  });

  it('should return full question data in full mode', async () => {
    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'full',
    };

    const result = await searchQuestions(searchParams);

    // Verify that correctAnswer and explanation are included
    expect(result.questions[0]).toHaveProperty('correctAnswer');
    expect(result.questions[0]).toHaveProperty('explanation');
    expect(result.questions[1]).toHaveProperty('correctAnswer');
    expect(result.questions[1]).toHaveProperty('explanation');
  });

  it('should exclude correctAnswer and explanation in compact mode', async () => {
    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'compact',
    };

    const result = await searchQuestions(searchParams);

    // Verify that correctAnswer and explanation are excluded
    expect(result.questions[0]).not.toHaveProperty('correctAnswer');
    expect(result.questions[0]).not.toHaveProperty('explanation');
    expect(result.questions[1]).not.toHaveProperty('correctAnswer');
    expect(result.questions[1]).not.toHaveProperty('explanation');

    // Verify that other properties are still included
    expect(result.questions[0]).toHaveProperty('question');
    expect(result.questions[0]).toHaveProperty('options');
    expect(result.questions[0]).toHaveProperty('difficulty');
    expect(result.questions[0]).toHaveProperty('category');
  });

  it('should only include _id and question in minimalist mode', async () => {
    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'minimalist',
    };

    const result = await searchQuestions(searchParams);

    // Verify that only _id and question are included
    expect(result.questions[0]).toHaveProperty('_id');
    expect(result.questions[0]).toHaveProperty('question');
    expect(Object.keys(result.questions[0]).length).toBe(2);

    expect(result.questions[1]).toHaveProperty('_id');
    expect(result.questions[1]).toHaveProperty('question');
    expect(Object.keys(result.questions[1]).length).toBe(2);

    // Verify that other properties are excluded
    expect(result.questions[0]).not.toHaveProperty('options');
    expect(result.questions[0]).not.toHaveProperty('correctAnswer');
    expect(result.questions[0]).not.toHaveProperty('explanation');
    expect(result.questions[0]).not.toHaveProperty('difficulty');
    expect(result.questions[0]).not.toHaveProperty('category');
  });
});
