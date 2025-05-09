/**
 * Tests for the getAllTopicsController module
 * @module test/controllers/topics/getAllTopicsController.test
 */

const {
  getAllTopicsController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/topics/getAllTopicsController');
const { getAllTopics } = require('../../../src/repository/topicRepository');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/repository/topicRepository');
jest.mock('../../../src/utils/logger');

describe('Get All Topics Controller', () => {
  // Sample data for testing
  const sampleTopics = [
    {
      _id: '60d21b4667d0d8992e610c85',
      title: 'JavaScript',
      difficulty: 3,
      popularity: 'high',
      suitable_level: 'junior',
      description: 'JavaScript programming language',
    },
    {
      _id: '60d21b4667d0d8992e610c86',
      title: 'React',
      difficulty: 4,
      popularity: 'high',
      suitable_level: 'mid',
      description: 'React library for building user interfaces',
    },
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('formatSuccessResponse', () => {
    test('should format success response correctly', () => {
      const response = formatSuccessResponse(sampleTopics);

      expect(response).toEqual({
        status: 'success',
        data: sampleTopics,
      });
    });

    test('should handle empty array', () => {
      const response = formatSuccessResponse([]);

      expect(response).toEqual({
        status: 'success',
        data: [],
      });
    });

    test('should handle null or undefined', () => {
      const responseNull = formatSuccessResponse(null);
      const responseUndefined = formatSuccessResponse(undefined);

      expect(responseNull).toEqual({
        status: 'success',
        data: null,
      });

      expect(responseUndefined).toEqual({
        status: 'success',
        data: undefined,
      });
    });
  });

  describe('formatErrorResponse', () => {
    test('should format error response correctly', () => {
      const error = new Error('Database connection failed');
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        message: 'Failed to retrieve topics.',
        error: 'Database connection failed',
      });
    });

    test('should handle error without message', () => {
      const error = new Error();
      const response = formatErrorResponse(error);

      expect(response).toEqual({
        status: 'error',
        message: 'Failed to retrieve topics.',
        error: '',
      });
    });
  });

  describe('getAllTopicsController', () => {
    // Mock request and response objects
    let req;
    let res;

    beforeEach(() => {
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
    });

    test('should return topics with 200 status code on success', async () => {
      // Setup mock implementation
      getAllTopics.mockResolvedValue(sampleTopics);

      // Call the controller
      await getAllTopicsController(req, res);

      // Verify response
      expect(getAllTopics).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: sampleTopics,
      });
    });

    test('should return empty array with 200 status code when no topics exist', async () => {
      // Setup mock implementation
      getAllTopics.mockResolvedValue([]);

      // Call the controller
      await getAllTopicsController(req, res);

      // Verify response
      expect(getAllTopics).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [],
      });
    });

    test('should return error with 500 status code on failure', async () => {
      // Setup mock implementation
      const error = new Error('Database connection failed');
      getAllTopics.mockRejectedValue(error);

      // Call the controller
      await getAllTopicsController(req, res);

      // Verify response
      expect(getAllTopics).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Error retrieving topics:', error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve topics.',
        error: 'Database connection failed',
      });
    });

    test('should handle unexpected errors gracefully', async () => {
      // Setup mock implementation for unexpected error
      getAllTopics.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      // Call the controller
      await getAllTopicsController(req, res);

      // Verify response
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Failed to retrieve topics.',
        })
      );
    });
  });
});
