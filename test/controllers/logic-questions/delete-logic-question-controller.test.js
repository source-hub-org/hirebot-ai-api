/**
 * Tests for Delete Logic Question Controller
 */

const {
  deleteLogicQuestionController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-questions/deleteLogicQuestionController');
const { deleteQuestion } = require('../../../src/services/logicQuestionService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicQuestionService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Delete Logic Question Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      params: {
        id: '60d21b4667d0d8992e610c87',
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
      const question = { _id: '123', question: 'Test question' };
      const result = formatSuccessResponse(question);

      expect(result).toEqual({
        status: 'success',
        data: question,
      });
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error response correctly', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = formatErrorResponse(errors);

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to delete logic question.',
        errors,
      });
    });
  });

  describe('deleteLogicQuestionController', () => {
    it('should delete a logic question successfully', async () => {
      // Mock successful question deletion
      const mockDeletedQuestion = {
        _id: '60d21b4667d0d8992e610c87',
        question: 'What is a closure in JavaScript?',
        level: 3,
        tag_ids: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
        type: 'multiple_choice',
        choices: [
          { text: 'A function that returns another function', is_correct: true },
          { text: 'A variable that cannot be changed', is_correct: false },
        ],
        answer_explanation:
          'A closure is a function that has access to its outer function scope even after the outer function has returned.',
      };

      deleteQuestion.mockResolvedValue({
        success: true,
        data: mockDeletedQuestion,
      });

      // Call the controller
      await deleteLogicQuestionController(req, res);

      // Verify service was called with correct parameters
      expect(deleteQuestion).toHaveBeenCalledWith('60d21b4667d0d8992e610c87');

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockDeletedQuestion,
      });
    });

    it('should return 404 when question is not found', async () => {
      // Mock question not found
      deleteQuestion.mockResolvedValue({
        success: false,
        errors: ['Question not found'],
      });

      // Call the controller
      await deleteLogicQuestionController(req, res);

      // Verify service was called
      expect(deleteQuestion).toHaveBeenCalledWith('60d21b4667d0d8992e610c87');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to delete logic question with ID 60d21b4667d0d8992e610c87:',
        ['Question not found']
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic question.',
        errors: ['Question not found'],
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Invalid question ID format'];

      deleteQuestion.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await deleteLogicQuestionController(req, res);

      // Verify service was called
      expect(deleteQuestion).toHaveBeenCalledWith('60d21b4667d0d8992e610c87');

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith(
        'Failed to delete logic question with ID 60d21b4667d0d8992e610c87:',
        errors
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic question.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      deleteQuestion.mockRejectedValue(error);

      // Call the controller
      await deleteLogicQuestionController(req, res);

      // Verify service was called
      expect(deleteQuestion).toHaveBeenCalledWith('60d21b4667d0d8992e610c87');

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith(
        'Error in delete logic question controller:',
        error
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to delete logic question.',
        errors: ['Internal server error'],
      });
    });
  });
});
