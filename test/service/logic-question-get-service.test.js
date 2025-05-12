/**
 * Tests for the Logic Question Get Service
 */

const { ObjectId } = require('mongodb');

// Mock the repository
jest.mock('../../src/repository/logicQuestionRepository', () => ({
  countLogicQuestions: jest.fn(),
  getLogicQuestionById: jest.fn(),
}));

// Mock the utility functions
jest.mock('../../src/utils/validateObjectId', () => ({
  isValidObjectId: jest.fn(),
}));

jest.mock('../../src/utils/logicQuestionQueryBuilder', () => ({
  buildFilter: jest.fn(),
  buildSortOptions: jest.fn(),
  buildPaginationOptions: jest.fn(),
}));

// Mock the query service
jest.mock('../../src/service/logicQuestionQueryService', () => ({
  getQuestionsWithStandardSort: jest.fn(),
  getQuestionsWithRandomSort: jest.fn(),
  calculatePagination: jest.fn(),
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('logicQuestionGetService', () => {
  let logicQuestionRepository;
  let validateObjectId;
  let logicQuestionQueryBuilder;
  let logicQuestionQueryService;
  let logger;
  let logicQuestionGetService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mocked modules
    logicQuestionRepository = require('../../src/repository/logicQuestionRepository');
    validateObjectId = require('../../src/utils/validateObjectId');
    logicQuestionQueryBuilder = require('../../src/utils/logicQuestionQueryBuilder');
    logicQuestionQueryService = require('../../src/service/logicQuestionQueryService');
    logger = require('../../src/utils/logger');

    // Import the module under test
    logicQuestionGetService = require('../../src/service/logicQuestionGetService');
  });

  describe('getQuestions', () => {
    test('should return questions with standard sorting', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockSortOptions = { createdAt: -1 };
      const mockPaginationOptions = { page: 1, limit: 10, skip: 0 };
      const mockQuestions = [
        { _id: new ObjectId(), title: 'Question 1' },
        { _id: new ObjectId(), title: 'Question 2' },
      ];
      const mockTotal = 2;
      const mockPagination = {
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Setup mock implementations
      logicQuestionQueryBuilder.buildFilter.mockReturnValue(mockFilter);
      logicQuestionQueryBuilder.buildSortOptions.mockReturnValue(mockSortOptions);
      logicQuestionQueryBuilder.buildPaginationOptions.mockReturnValue(mockPaginationOptions);
      logicQuestionRepository.countLogicQuestions.mockResolvedValue(mockTotal);
      logicQuestionQueryService.getQuestionsWithStandardSort.mockResolvedValue(mockQuestions);
      logicQuestionQueryService.calculatePagination.mockReturnValue(mockPagination);

      // Call the function
      const result = await logicQuestionGetService.getQuestions({
        sort_by: 'createdAt',
        sort_direction: 'desc',
      });

      // Assertions
      expect(logicQuestionQueryBuilder.buildFilter).toHaveBeenCalled();
      expect(logicQuestionQueryBuilder.buildSortOptions).toHaveBeenCalled();
      expect(logicQuestionQueryBuilder.buildPaginationOptions).toHaveBeenCalled();
      expect(logicQuestionRepository.countLogicQuestions).toHaveBeenCalledWith(mockFilter);
      expect(logicQuestionQueryService.getQuestionsWithStandardSort).toHaveBeenCalledWith(
        mockFilter,
        mockSortOptions,
        mockPaginationOptions
      );
      expect(logicQuestionQueryService.calculatePagination).toHaveBeenCalledWith(
        mockTotal,
        mockPaginationOptions
      );
      expect(logger.info).toHaveBeenCalledWith(
        `Retrieved ${mockQuestions.length} logic questions (total: ${mockTotal})`
      );

      expect(result).toEqual({
        success: true,
        data: mockQuestions,
        pagination: mockPagination,
      });
    });

    test('should return questions with random sorting', async () => {
      // Setup mock data
      const mockFilter = { topic: 'JavaScript' };
      const mockSortOptions = null;
      const mockPaginationOptions = { page: 1, limit: 10, skip: 0 };
      const mockQuestions = [
        { _id: new ObjectId(), title: 'Question 1' },
        { _id: new ObjectId(), title: 'Question 2' },
      ];
      const mockTotal = 2;
      const mockPagination = {
        total: mockTotal,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Setup mock implementations
      logicQuestionQueryBuilder.buildFilter.mockReturnValue(mockFilter);
      logicQuestionQueryBuilder.buildSortOptions.mockReturnValue(mockSortOptions);
      logicQuestionQueryBuilder.buildPaginationOptions.mockReturnValue(mockPaginationOptions);
      logicQuestionRepository.countLogicQuestions.mockResolvedValue(mockTotal);
      logicQuestionQueryService.getQuestionsWithRandomSort.mockResolvedValue(mockQuestions);
      logicQuestionQueryService.calculatePagination.mockReturnValue(mockPagination);

      // Call the function
      const result = await logicQuestionGetService.getQuestions({
        sort_by: 'random',
        sort_direction: 'desc',
      });

      // Assertions
      expect(logicQuestionQueryService.getQuestionsWithRandomSort).toHaveBeenCalledWith(
        mockFilter,
        mockPaginationOptions
      );

      expect(result).toEqual({
        success: true,
        data: mockQuestions,
        pagination: mockPagination,
      });
    });

    test('should handle errors', async () => {
      // Setup mock implementations to throw an error
      const mockError = new Error('Database error');
      logicQuestionQueryBuilder.buildFilter.mockImplementation(() => {
        throw mockError;
      });

      // Call the function
      const result = await logicQuestionGetService.getQuestions({});

      // Assertions
      expect(logger.error).toHaveBeenCalledWith('Error retrieving logic questions:', mockError);
      expect(result).toEqual({
        success: false,
        errors: [mockError.message],
      });
    });
  });

  describe('getQuestionById', () => {
    test('should return a question when valid ID is provided', async () => {
      // Setup mock data
      const mockId = new ObjectId().toString();
      const mockQuestion = {
        _id: mockId,
        title: 'Test Question',
        description: 'Test Description',
      };

      // Setup mock implementations
      validateObjectId.isValidObjectId.mockReturnValue(true);
      logicQuestionRepository.getLogicQuestionById.mockResolvedValue(mockQuestion);

      // Call the function
      const result = await logicQuestionGetService.getQuestionById(mockId);

      // Assertions
      expect(validateObjectId.isValidObjectId).toHaveBeenCalledWith(mockId);
      expect(logicQuestionRepository.getLogicQuestionById).toHaveBeenCalledWith(mockId);
      expect(logger.info).toHaveBeenCalledWith(`Retrieved logic question with ID ${mockId}`);

      expect(result).toEqual({
        success: true,
        data: mockQuestion,
      });
    });

    test('should return error when invalid ID format is provided', async () => {
      // Setup mock data
      const invalidId = 'invalid-id';

      // Setup mock implementations
      validateObjectId.isValidObjectId.mockReturnValue(false);

      // Call the function
      const result = await logicQuestionGetService.getQuestionById(invalidId);

      // Assertions
      expect(validateObjectId.isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(logicQuestionRepository.getLogicQuestionById).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid logic question ID format: ${invalidId}`);

      expect(result).toEqual({
        success: false,
        errors: ['Invalid question ID format'],
      });
    });

    test('should return error when question is not found', async () => {
      // Setup mock data
      const mockId = new ObjectId().toString();

      // Setup mock implementations
      validateObjectId.isValidObjectId.mockReturnValue(true);
      logicQuestionRepository.getLogicQuestionById.mockResolvedValue(null);

      // Call the function
      const result = await logicQuestionGetService.getQuestionById(mockId);

      // Assertions
      expect(validateObjectId.isValidObjectId).toHaveBeenCalledWith(mockId);
      expect(logicQuestionRepository.getLogicQuestionById).toHaveBeenCalledWith(mockId);
      expect(logger.warn).toHaveBeenCalledWith(`Logic question with ID ${mockId} not found`);

      expect(result).toEqual({
        success: false,
        errors: ['Question not found'],
      });
    });

    test('should handle errors', async () => {
      // Setup mock data
      const mockId = new ObjectId().toString();
      const mockError = new Error('Database error');

      // Setup mock implementations
      validateObjectId.isValidObjectId.mockReturnValue(true);
      logicQuestionRepository.getLogicQuestionById.mockRejectedValue(mockError);

      // Call the function
      const result = await logicQuestionGetService.getQuestionById(mockId);

      // Assertions
      expect(validateObjectId.isValidObjectId).toHaveBeenCalledWith(mockId);
      expect(logicQuestionRepository.getLogicQuestionById).toHaveBeenCalledWith(mockId);
      expect(logger.error).toHaveBeenCalledWith(
        `Error retrieving logic question with ID ${mockId}:`,
        mockError
      );

      expect(result).toEqual({
        success: false,
        errors: [mockError.message],
      });
    });
  });
});
