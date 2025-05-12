/**
 * Tests for Update Logic Tag Controller
 */

const {
  updateLogicTagController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-tags/updateLogicTagController');
const { updateTag } = require('../../../src/service/logicTagService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/service/logicTagService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Update Logic Tag Controller', () => {
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
      body: {
        name: 'JavaScript ES6',
        description: 'Modern JavaScript with ES6+ features',
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
        message: 'Failed to update logic tag.',
        errors,
      });
    });
  });

  describe('updateLogicTagController', () => {
    it('should update a logic tag successfully', async () => {
      // Mock successful tag update
      const mockUpdatedTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript ES6',
        slug: 'javascript-es6',
        description: 'Modern JavaScript with ES6+ features',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
      };

      updateTag.mockResolvedValue({
        success: true,
        data: mockUpdatedTag,
      });

      // Call the controller
      await updateLogicTagController(req, res);

      // Verify service was called with correct parameters
      expect(updateTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85', req.body);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUpdatedTag,
      });
    });

    it('should return 404 when tag is not found', async () => {
      // Mock tag not found
      updateTag.mockResolvedValue({
        success: false,
        errors: ['Tag not found'],
      });

      // Call the controller
      await updateLogicTagController(req, res);

      // Verify service was called
      expect(updateTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85', req.body);

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to update logic tag with ID 60d21b4667d0d8992e610c85:',
        ['Tag not found']
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to update logic tag.',
        errors: ['Tag not found'],
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Tag name must be a string', 'Tag name cannot be empty'];

      updateTag.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await updateLogicTagController(req, res);

      // Verify service was called
      expect(updateTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85', req.body);

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to update logic tag with ID 60d21b4667d0d8992e610c85:',
        errors
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to update logic tag.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      updateTag.mockRejectedValue(error);

      // Call the controller
      await updateLogicTagController(req, res);

      // Verify service was called
      expect(updateTag).toHaveBeenCalledWith('60d21b4667d0d8992e610c85', req.body);

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in update logic tag controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to update logic tag.',
        errors: ['Internal server error'],
      });
    });
  });
});
