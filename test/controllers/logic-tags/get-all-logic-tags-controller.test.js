/**
 * Tests for Get All Logic Tags Controller
 */

const {
  getAllLogicTagsController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-tags/getAllLogicTagsController');
const { getAllTags } = require('../../../src/services/logicTagService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicTagService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Get All Logic Tags Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {};

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('formatSuccessResponse', () => {
    it('should format a success response correctly', () => {
      const tags = [
        { _id: '123', name: 'JavaScript', slug: 'javascript' },
        { _id: '456', name: 'Python', slug: 'python' },
      ];
      const result = formatSuccessResponse(tags);

      expect(result).toEqual({
        status: 'success',
        data: tags,
      });
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error response correctly', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = formatErrorResponse(errors);

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to retrieve logic tags.',
        errors,
      });
    });
  });

  describe('getAllLogicTagsController', () => {
    it('should retrieve all logic tags successfully', async () => {
      // Mock successful tags retrieval
      const mockTags = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'JavaScript',
          slug: 'javascript',
          description: 'JavaScript programming language',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          name: 'Python',
          slug: 'python',
          description: 'Python programming language',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      getAllTags.mockResolvedValue({
        success: true,
        data: mockTags,
      });

      // Call the controller
      await getAllLogicTagsController(req, res);

      // Verify service was called
      expect(getAllTags).toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTags,
      });
    });

    it('should handle empty tags array', async () => {
      // Mock empty tags array
      getAllTags.mockResolvedValue({
        success: true,
        data: [],
      });

      // Call the controller
      await getAllLogicTagsController(req, res);

      // Verify service was called
      expect(getAllTags).toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [],
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Database query failed'];

      getAllTags.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await getAllLogicTagsController(req, res);

      // Verify service was called
      expect(getAllTags).toHaveBeenCalled();

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith('Failed to retrieve logic tags:', errors);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic tags.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      getAllTags.mockRejectedValue(error);

      // Call the controller
      await getAllLogicTagsController(req, res);

      // Verify service was called
      expect(getAllTags).toHaveBeenCalled();

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in get all logic tags controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic tags.',
        errors: ['Internal server error'],
      });
    });
  });
});
