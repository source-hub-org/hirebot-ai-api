/**
 * Tests for Delete Logic Tag Controller
 */

const {
  deleteLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-tags/deleteLogicTagController');
const { deleteTag } = require('../../../src/services/logicTagService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicTagService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Delete Logic Tag Controller', () => {
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
        message: 'Failed to delete logic tag.',
        errors,
      });
    });
  });

  describe('deleteLogicTagController', () => {
    it('should delete a logic tag successfully', async () => {
      // Mock successful tag deletion
      const mockDeletedTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      deleteTag.mockResolvedValue({
        success: true,
        data: mockDeletedTag,
      });

      // Call the controller
      await deleteLogicTagController(req, res);

      // Verify service was called with correct parameters
      expect(deleteTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDeletedTag,
      });
    });

    it('should return 404 when tag is not found', async () => {
      // Mock tag not found
      deleteTag.mockResolvedValue({
        success: false,
        errors: ['Tag not found'],
      });

      // Call the controller
      await deleteLogicTagController(req, res);

      // Verify service was called
      expect(deleteTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to delete logic tag with ID 60d21b4667d0d8992e610c85:',
        ['Tag not found']
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic tag.',
        errors: ['Tag not found'],
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Invalid tag ID format'];

      deleteTag.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await deleteLogicTagController(req, res);

      // Verify service was called
      expect(deleteTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to delete logic tag with ID 60d21b4667d0d8992e610c85:',
        errors
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic tag.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      deleteTag.mockRejectedValue(error);

      // Call the controller
      await deleteLogicTagController(req, res);

      // Verify service was called
      expect(deleteTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85');

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in delete logic tag controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic tag.',
        errors: ['Internal server error'],
      });
    });
  });
});
