/**
 * Tests for Create Logic Question Controller
 */

const {
  createLogicQuestionController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-questions/createLogicQuestionController');
const { createQuestion } = require('../../../src/services/logicQuestionService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicQuestionService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Create Logic Question Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
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
        message: 'Failed to create logic question.',
        errors,
      });
    });
  });

  describe('createLogicQuestionController', () => {
    it('should create a logic question successfully', async () => {
      // Mock successful question creation
      const mockQuestion = {
        _id: '60d21b4667d0d8992e610c87',
        ...req.body,
      };

      createQuestion.mockResolvedValue({
        success: true,
        data: mockQuestion,
      });

      // Call the controller
      await createLogicQuestionController(req, res);

      // Verify service was called with correct parameters
      expect(createQuestion).toHaveBeenCalledWith(req.body);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockQuestion,
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Question text is required', 'At least one tag ID is required'];

      createQuestion.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await createLogicQuestionController(req, res);

      // Verify service was called
      expect(createQuestion).toHaveBeenCalledWith(req.body);

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith('Failed to create logic question:', errors);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create logic question.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      createQuestion.mockRejectedValue(error);

      // Call the controller
      await createLogicQuestionController(req, res);

      // Verify service was called
      expect(createQuestion).toHaveBeenCalledWith(req.body);

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith(
        'Error in create logic question controller:',
        error
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to create logic question.',
        errors: ['Internal server error'],
      });
    });
  });
});
