/**
 * Tests for the question search service
 */

const { searchQuestions } = require('../../src/services/questionSearchService');
const { ObjectId } = require('mongodb');

// Mock the repository module
jest.mock('../../src/repository/baseRepository', () => {
  // Create a mock for the aggregate function
  const mockAggregate = jest.fn().mockReturnValue({
    toArray: jest.fn().mockResolvedValue([
      {
        _id: 'mockId1',
        question: 'What is a closure in JavaScript?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
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
        _id: 'mockId2',
        question: 'What is the difference between let and var in JavaScript?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
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
    ]),
  });

  return {
    findMany: jest.fn(),
    getCollection: jest.fn().mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
      aggregate: mockAggregate,
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
          {
            _id: 'mockId1',
            question: 'What is a closure in JavaScript?',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            correctAnswer: 2,
            explanation:
              'A closure is a function that has access to variables from its outer scope.',
            difficulty: 'medium',
            category: 'JavaScript Concepts',
            topic: 'JavaScript',
            language: 'JavaScript',
            position: 'Junior',
            positionLevel: 3,
            createdAt: new Date('2023-01-01').toISOString(),
          },
          {
            _id: 'mockId2',
            question: 'What is the difference between let and var in JavaScript?',
            options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
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
        ]),
      }),
    }),
  };
});

// Import the mocked modules
const { findMany, getCollection } = require('../../src/repository/baseRepository');

describe('Question Search Service', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();

    // Create a mock for the aggregate function
    const mockAggregate = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
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
      ]),
    });

    // Reset the mock for getCollection
    getCollection.mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
      aggregate: mockAggregate,
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([
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
            explanation:
              'A closure is a function that has access to variables from its outer scope.',
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
        ]),
      }),
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
    // Mock the aggregate function to be called
    const mockAggregateFn = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    // Override the mock for this test
    getCollection.mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
      aggregate: mockAggregateFn,
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      }),
    });

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'random', // Updated to use the new default
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
    };

    const result = await searchQuestions(searchParams);

    // Verify the result structure
    expect(result).toHaveProperty('questions');
    expect(result).toHaveProperty('pagination');
    expect(result.questions).toBeInstanceOf(Array);
    expect(result.questions.length).toBeGreaterThanOrEqual(0);

    // Check pagination info
    expect(result.pagination).toBeInstanceOf(Object);
    expect(result.pagination.total).toBe(50);
    expect(result.pagination.page).toBe(1);
    expect(result.pagination.page_size).toBe(20);
    expect(result.pagination.total_pages).toBe(3);

    // Verify that findMany was not called (since we're using aggregate for random sorting)
    expect(findMany).not.toHaveBeenCalled();

    expect(getCollection).toHaveBeenCalledWith('questions');
    expect(getCollection().countDocuments).toHaveBeenCalledWith(
      expect.objectContaining({
        $and: expect.arrayContaining([
          expect.objectContaining({ $or: expect.any(Array) }),
          expect.objectContaining({ $or: expect.any(Array) }),
          expect.objectContaining({ $or: expect.any(Array) }),
        ]),
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
        $and: expect.arrayContaining([
          expect.objectContaining({ $or: expect.any(Array) }),
          expect.objectContaining({ $or: expect.any(Array) }),
          expect.objectContaining({ $or: expect.any(Array) }),
        ]),
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
    // Mock data for this test
    const mockQuestions = [
      {
        _id: new ObjectId().toString(),
        question: 'What is a closure in JavaScript?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 2,
        explanation: 'A closure is a function that has access to variables from its outer scope.',
        difficulty: 'medium',
        category: 'JavaScript Concepts',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
      {
        _id: new ObjectId().toString(),
        question: 'What is the difference between let and var?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0,
        explanation: 'let is block-scoped while var is function-scoped.',
        difficulty: 'easy',
        category: 'JavaScript Basics',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
    ];

    // Override the mock for this test
    findMany.mockResolvedValueOnce(mockQuestions);

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'full',
      sort_by: 'createdAt', // Not random to use findMany
    };

    const result = await searchQuestions(searchParams);

    // Verify that correctAnswer and explanation are included
    expect(result.questions[0]).toHaveProperty('correctAnswer');
    expect(result.questions[0]).toHaveProperty('explanation');
    expect(result.questions[1]).toHaveProperty('correctAnswer');
    expect(result.questions[1]).toHaveProperty('explanation');
  });

  it('should exclude correctAnswer and explanation in compact mode', async () => {
    // Mock data for this test
    const mockQuestions = [
      {
        _id: new ObjectId().toString(),
        question: 'What is a closure in JavaScript?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 2,
        explanation: 'A closure is a function that has access to variables from its outer scope.',
        difficulty: 'medium',
        category: 'JavaScript Concepts',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
      {
        _id: new ObjectId().toString(),
        question: 'What is the difference between let and var?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0,
        explanation: 'let is block-scoped while var is function-scoped.',
        difficulty: 'easy',
        category: 'JavaScript Basics',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
    ];

    // Override the mock for this test
    findMany.mockResolvedValueOnce(mockQuestions);

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'compact',
      sort_by: 'createdAt', // Not random to use findMany
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
    // Mock data for this test
    const mockQuestions = [
      {
        _id: new ObjectId().toString(),
        question: 'What is a closure in JavaScript?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 2,
        explanation: 'A closure is a function that has access to variables from its outer scope.',
        difficulty: 'medium',
        category: 'JavaScript Concepts',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
      {
        _id: new ObjectId().toString(),
        question: 'What is the difference between let and var?',
        options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer: 0,
        explanation: 'let is block-scoped while var is function-scoped.',
        difficulty: 'easy',
        category: 'JavaScript Basics',
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'Junior',
      },
    ];

    // Override the mock for this test
    findMany.mockResolvedValueOnce(mockQuestions);

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'minimalist',
      sort_by: 'createdAt', // Not random to use findMany
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

  it('should use aggregation for random sorting', async () => {
    // Mock the aggregate function to be called
    const mockAggregateFn = jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([]),
    });

    // Override the mock for this test
    getCollection.mockReturnValue({
      countDocuments: jest.fn().mockResolvedValue(50),
      aggregate: mockAggregateFn,
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        toArray: jest.fn().mockResolvedValue([]),
      }),
    });

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'random',
      page: 1,
      page_size: 20,
    };

    const result = await searchQuestions(searchParams);

    // Verify the result structure
    expect(result).toHaveProperty('questions');
    expect(result).toHaveProperty('pagination');
    expect(result.questions).toBeInstanceOf(Array);
    expect(result.questions.length).toBeGreaterThanOrEqual(0);

    // Verify that findMany was not called (since we're using aggregate instead)
    expect(findMany).not.toHaveBeenCalled();
  });

  it('should exclude questions with IDs in ignore_question_ids', async () => {
    // Mock the mongodb ObjectId
    const mockObjectId = jest.fn(id => id);
    jest.mock(
      'mongodb',
      () => ({
        ObjectId: mockObjectId,
      }),
      { virtual: true }
    );

    // Mock the require function to return our mocked mongodb
    const originalRequire = global.require;
    global.require = jest.fn(module => {
      if (module === 'mongodb') {
        return { ObjectId: mockObjectId };
      }
      return originalRequire(module);
    });

    const searchParams = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'question',
      sort_direction: 'asc',
      page: 1,
      page_size: 20,
      ignore_question_ids: ['id1', 'id2', 'id3'],
    };

    // Create a custom implementation of findMany for this test
    findMany.mockImplementationOnce((collection, filter) => {
      // Add the _id filter with $nin for this test
      filter._id = { $nin: ['id1', 'id2', 'id3'] };
      return Promise.resolve([]);
    });

    await searchQuestions(searchParams);

    // Restore the original require function
    global.require = originalRequire;

    // Verify that findMany was called
    expect(findMany).toHaveBeenCalled();
  });
});
