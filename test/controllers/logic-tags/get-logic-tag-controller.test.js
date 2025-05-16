/**
 * Tests for Get Logic Tag Controller
 */

const {
  getLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-tags/getLogicTagController');
const { getTagById } = require('../../../src/services/logicTagService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicTagService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Get Logic Tag Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      params: {
        id: '60d21b4667d0d8992e610c85',
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
        message: 'Failed to retrieve logic tag.',
        errors,
      });
    });
  });

  describe('getLogicTagController', () => {
    it('should retrieve a logic tag successfully', async () => {
      // Mock successful tag retrieval
      const mockTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      getTagById.mockResolvedValue({
        success: true,
        data: mockTag,
      });

      // Call the controller
      await getLogicTagController(req, res);

      // Verify service was called with correct parameters
      expect(getTagById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockTag,
      });
    });

    it('should return 404 when tag is not found', async () => {
      // Mock tag not found
      getTagById.mockResolvedValue({
        success: false,
        errors: ['Tag not found'],
      });

      // Call the controller
      await getLogicTagController(req, res);

      // Verify service was called
      expect(getTagById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to retrieve logic tag with ID 60d21b4667d0d8992e610c85:',
        ['Tag not found']
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic tag.',
        errors: ['Tag not found'],
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      getTagById.mockResolvedValue({
        success: false,
        errors: ['Invalid tag ID format'],
      });

      // Call the controller
      await getLogicTagController(req, res);

      // Verify service was called
      expect(getTagById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to retrieve logic tag with ID 60d21b4667d0d8992e610c85:',
        ['Invalid tag ID format']
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic tag.',
        errors: ['Invalid tag ID format'],
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      getTagById.mockRejectedValue(error);

      // Call the controller
      await getLogicTagController(req, res);

      // Verify service was called
      expect(getTagById).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in get logic tag controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic tag.',
        errors: ['Internal server error'],
      });
    });
  });
});
