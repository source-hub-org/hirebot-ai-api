/**
 * Tests for Create Logic Tag Controller
 */

const {
  createLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-tags/createLogicTagController');
const { createTag } = require('../../../src/services/logicTagService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicTagService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Create Logic Tag Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
        name: 'JavaScript',
        description: 'JavaScript programming language',
      },
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('formatSuccessResponse', () => {
    it('should format a success response correctly', () => {
      const tag = { _id: '123', name: 'JavaScript', slug: 'javascript' };
      const result = formatSuccessResponse(tag);

      expect(result).toEqual({
        status: 'success',
        data: tag,
      });
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error response correctly', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = formatErrorResponse(errors);

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to create logic tag.',
        errors,
      });
    });
  });

  describe('createLogicTagController', () => {
    it('should create a logic tag successfully', async () => {
      // Mock successful tag creation
      const mockTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      createTag.mockResolvedValue({
        success: true,
        data: mockTag,
      });

      // Call the controller
      await createLogicTagController(req, res);

      // Verify service was called with correct parameters
      expect(createTag).toHaveBeenCalledWith(req.body);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTag,
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Tag name is required', 'Tag description must be a string'];

      createTag.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await createLogicTagController(req, res);

      // Verify service was called
      expect(createTag).toHaveBeenCalledWith(req.body);

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith('Failed to create logic tag:', errors);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create logic tag.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      createTag.mockRejectedValue(error);

      // Call the controller
      await createLogicTagController(req, res);

      // Verify service was called
      expect(createTag).toHaveBeenCalledWith(req.body);

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in create logic tag controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create logic tag.',
        errors: ['Internal server error'],
      });
    });
  });
});
