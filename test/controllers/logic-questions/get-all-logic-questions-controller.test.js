/**
 * Tests for Get All Logic Questions Controller
 */

const {
  getAllLogicQuestionsController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/logic-questions/getAllLogicQuestionsController');
const { getQuestions } = require('../../../src/services/logicQuestionGetService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/logicQuestionGetService');
jest.mock('../../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Get All Logic Questions Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      query: {
        level: '3',
        tag_id: '60d21b4667d0d8992e610c85',
        type: 'multiple_choice',
        page: '1',
        page_size: '10',
        sort_by: 'createdAt',
        sort_direction: 'desc',
        ignore_question_ids: '60d21b4667d0d8992e610c87,60d21b4667d0d8992e610c88',
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
      const questions = [{ _id: '123', question: 'Test question' }];
      const pagination = { total: 1, page: 1, page_size: 10, total_pages: 1 };
      const result = formatSuccessResponse(questions, pagination);

      expect(result).toEqual({
        status: 'success',
        data: questions,
        pagination,
      });
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error response correctly', () => {
      const errors = ['Error 1', 'Error 2'];
      const result = formatErrorResponse(errors);

      expect(result).toEqual({
        status: 'error',
        message: 'Failed to retrieve logic questions.',
        errors,
      });
    });
  });

  describe('getAllLogicQuestionsController', () => {
    it('should retrieve logic questions successfully', async () => {
      // Mock successful questions retrieval
      const mockQuestions = [
        {
          _id: '60d21b4667d0d8992e610c89',
          question: 'What is a closure in JavaScript?',
          level: 3,
          tag_ids: [{ _id: '60d21b4667d0d8992e610c85', name: 'JavaScript', slug: 'javascript' }],
          type: 'multiple_choice',
          choices: [
            { text: 'A function that returns another function', is_correct: true },
            { text: 'A variable that cannot be changed', is_correct: false },
          ],
          answer_explanation:
            'A closure is a function that has access to its outer function scope even after the outer function has returned.',
        },
      ];

      const mockPagination = {
        total: 1,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };

      getQuestions.mockResolvedValue({
        success: true,
        data: mockQuestions,
        pagination: mockPagination,
      });

      // Call the controller
      await getAllLogicQuestionsController(req, res);

      // Verify service was called with correct parameters
      expect(getQuestions).toHaveBeenCalledWith({
        level: '3',
        tag_id: '60d21b4667d0d8992e610c85',
        type: 'multiple_choice',
        page: '1',
        limit: '10', // This is added by the controller for backward compatibility
        page_size: '10',
        sort_by: 'createdAt',
        sort_direction: 'desc',
        ignore_question_ids: '60d21b4667d0d8992e610c87,60d21b4667d0d8992e610c88',
      });

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockQuestions,
        pagination: mockPagination,
      });
    });

    it('should handle empty query parameters', async () => {
      // Mock request with empty query
      req.query = {};

      const mockQuestions = [
        { _id: '60d21b4667d0d8992e610c89', question: 'Question 1' },
        { _id: '60d21b4667d0d8992e610c90', question: 'Question 2' },
      ];

      const mockPagination = {
        total: 2,
        page: 1,
        page_size: 10,
        total_pages: 1,
      };

      getQuestions.mockResolvedValue({
        success: true,
        data: mockQuestions,
        pagination: mockPagination,
      });

      // Call the controller
      await getAllLogicQuestionsController(req, res);

      // Verify service was called with empty parameters
      expect(getQuestions).toHaveBeenCalledWith({});

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockQuestions,
        pagination: mockPagination,
      });
    });

    it('should return 400 when validation fails', async () => {
      // Mock validation failure
      const errors = ['Invalid level value', 'Invalid tag_id format'];

      getQuestions.mockResolvedValue({
        success: false,
        errors,
      });

      // Call the controller
      await getAllLogicQuestionsController(req, res);

      // Verify service was called
      expect(getQuestions).toHaveBeenCalledWith({
        level: '3',
        tag_id: '60d21b4667d0d8992e610c85',
        type: 'multiple_choice',
        page: '1',
        limit: '10', // This is added by the controller for backward compatibility
        page_size: '10',
        sort_by: 'createdAt',
        sort_direction: 'desc',
        ignore_question_ids: '60d21b4667d0d8992e610c87,60d21b4667d0d8992e610c88',
      });

      // Verify logger was called
      expect(logger.warn).toHaveBeenCalledWith('Failed to retrieve logic questions:', errors);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic questions.',
        errors,
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      getQuestions.mockRejectedValue(error);

      // Call the controller
      await getAllLogicQuestionsController(req, res);

      // Verify service was called
      expect(getQuestions).toHaveBeenCalledWith({
        level: '3',
        tag_id: '60d21b4667d0d8992e610c85',
        type: 'multiple_choice',
        page: '1',
        limit: '10', // This is added by the controller for backward compatibility
        page_size: '10',
        sort_by: 'createdAt',
        sort_direction: 'desc',
        ignore_question_ids: '60d21b4667d0d8992e610c87,60d21b4667d0d8992e610c88',
      });

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith(
        'Error in get all logic questions controller:',
        error
      );

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'Failed to retrieve logic questions.',
        errors: ['Internal server error'],
      });
    });
  });
});
