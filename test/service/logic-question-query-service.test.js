/**
 * Tests for the Logic Question Query Service
 */

const { ObjectId } = require('mongodb');

// Mock the repository
jest.mock('../../src/repository/logicQuestionRepository', () => ({
  getLogicQuestions: jest.fn(),
  countLogicQuestions: jest.fn(),
}));

// Mock the utility functions
jest.mock('../../src/utils/logicQuestionQueryBuilder', () => ({
  buildFilter: jest.fn(),
  buildSortOptions: jest.fn(),
  buildPaginationOptions: jest.fn(),
}));

jest.mock('../../src/utils/randomSortingUtils', () => ({
  getRandomDocuments: jest.fn(),
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock the LogicQuestion model
jest.mock('../../src/models/logicQuestionModel', () => {
  const mockModel = function (doc) {
    return { ...doc, _id: doc._id || 'mock-id' };
  };
  mockModel.collection = {
    find: jest.fn(),
  };
  mockModel.populate = jest.fn();
  return mockModel;
});

describe('logicQuestionQueryService', () => {
  let logicQuestionRepository;
  let randomSortingUtils;
  let logger;
  let LogicQuestionModel;
  let logicQuestionQueryService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mocked modules
    logicQuestionRepository = require('../../src/repository/logicQuestionRepository');
    logicQuestionQueryBuilder = require('../../src/utils/logicQuestionQueryBuilder');
    randomSortingUtils = require('../../src/utils/randomSortingUtils');
    logger = require('../../src/utils/logger');
    LogicQuestionModel = require('../../src/models/logicQuestionModel');

    // Import the module under test
    logicQuestionQueryService = require('../../src/service/logicQuestionQueryService');
  });

  describe('getQuestionsWithStandardSort', () => {
    test('should return questions with standard sorting using page_size', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockSortOptions = { createdAt: -1 };
      const mockPaginationOptions = { skip: 0, limit: 10, page_size: 10 };
      const mockQuestions = [
        { _id: new ObjectId(), title: 'Question 1' },
        { _id: new ObjectId(), title: 'Question 2' },
      ];

      // Setup mock implementations
      logicQuestionRepository.getLogicQuestions.mockResolvedValue(mockQuestions);

      // Call the function
      const result = await logicQuestionQueryService.getQuestionsWithStandardSort(
        mockFilter,
        mockSortOptions,
        mockPaginationOptions
      );

      // Assertions
      expect(logicQuestionRepository.getLogicQuestions).toHaveBeenCalledWith(mockFilter, {
        sort: mockSortOptions,
        skip: mockPaginationOptions.skip,
        limit: mockPaginationOptions.page_size,
      });

      expect(result).toEqual(mockQuestions);
    });

    test('should return questions with standard sorting using limit (legacy)', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockSortOptions = { createdAt: -1 };
      const mockPaginationOptions = { skip: 0, limit: 10 }; // No page_size
      const mockQuestions = [
        { _id: new ObjectId(), title: 'Question 1' },
        { _id: new ObjectId(), title: 'Question 2' },
      ];

      // Setup mock implementations
      logicQuestionRepository.getLogicQuestions.mockResolvedValue(mockQuestions);

      // Call the function
      const result = await logicQuestionQueryService.getQuestionsWithStandardSort(
        mockFilter,
        mockSortOptions,
        mockPaginationOptions
      );

      // Assertions
      expect(logicQuestionRepository.getLogicQuestions).toHaveBeenCalledWith(mockFilter, {
        sort: mockSortOptions,
        skip: mockPaginationOptions.skip,
        limit: mockPaginationOptions.limit,
      });

      expect(result).toEqual(mockQuestions);
    });
  });

  describe('getQuestionsWithRandomSort', () => {
    test('should return randomly sorted questions', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockPaginationOptions = { skip: 0, limit: 10 };
      const mockRandomDocs = [
        { _id: new ObjectId(), title: 'Question 1' },
        { _id: new ObjectId(), title: 'Question 2' },
      ];

      // Setup mock implementations
      randomSortingUtils.getRandomDocuments.mockResolvedValue(mockRandomDocs);
      LogicQuestionModel.populate.mockImplementation(doc => {
        doc.tag_ids = [{ name: 'Tag1', slug: 'tag1' }];
        return Promise.resolve(doc);
      });

      // Call the function
      const result = await logicQuestionQueryService.getQuestionsWithRandomSort(
        mockFilter,
        mockPaginationOptions
      );

      // Assertions
      expect(randomSortingUtils.getRandomDocuments).toHaveBeenCalledWith(
        LogicQuestionModel.collection,
        mockFilter,
        mockPaginationOptions
      );

      expect(LogicQuestionModel.populate).toHaveBeenCalledTimes(mockRandomDocs.length);
      expect(result).toHaveLength(mockRandomDocs.length);
      expect(result[0].tag_ids).toEqual([{ name: 'Tag1', slug: 'tag1' }]);
    });

    test('should handle errors', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockPaginationOptions = { skip: 0, limit: 10 };
      const mockError = new Error('Database error');

      // Setup mock implementations
      randomSortingUtils.getRandomDocuments.mockRejectedValue(mockError);

      // Call the function
      const result = await logicQuestionQueryService.getQuestionsWithRandomSort(
        mockFilter,
        mockPaginationOptions
      );

      // Assertions
      expect(randomSortingUtils.getRandomDocuments).toHaveBeenCalledWith(
        LogicQuestionModel.collection,
        mockFilter,
        mockPaginationOptions
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error getting questions with random sort:',
        mockError
      );
      expect(result).toEqual([]);
    });
  });

  describe('calculatePagination', () => {
    test('should calculate pagination info correctly with page_size', () => {
      // Test cases
      const testCases = [
        {
          total: 25,
          paginationOptions: { page: 1, page_size: 10, limit: 10 },
          expected: {
            total: 25,
            page: 1,
            page_size: 10,
            total_pages: 3,
            hasNextPage: true,
            hasPrevPage: false,
          },
        },
        {
          total: 25,
          paginationOptions: { page: 2, page_size: 10, limit: 10 },
          expected: {
            total: 25,
            page: 2,
            page_size: 10,
            total_pages: 3,
            hasNextPage: true,
            hasPrevPage: true,
          },
        },
        {
          total: 25,
          paginationOptions: { page: 3, page_size: 10, limit: 10 },
          expected: {
            total: 25,
            page: 3,
            page_size: 10,
            total_pages: 3,
            hasNextPage: false,
            hasPrevPage: true,
          },
        },
        {
          total: 0,
          paginationOptions: { page: 1, page_size: 10, limit: 10 },
          expected: {
            total: 0,
            page: 1,
            page_size: 10,
            total_pages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      ];

      // Run test cases
      testCases.forEach(({ total, paginationOptions, expected }) => {
        const result = logicQuestionQueryService.calculatePagination(total, paginationOptions);
        expect(result).toEqual(expected);
      });
    });
  });
});
