/**
 * Tests for Question Request Controller
 */

const {
  processQuestionRequestController,
  validateRequestParams,
  formatJobsResponse,
  formatSuccessResponse,
  formatErrorResponse,
  formatValidationErrorResponse,
} = require('../../../src/controllers/questions/requestController');
const { processQuestionRequest } = require('../../../src/services/questionRequestService');
const logger = require('../../../src/utils/logger');

// Mock dependencies
jest.mock('../../../src/services/questionRequestService');
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Question Request Controller', () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'senior',
        language: 'javascript',
      },
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('validateRequestParams', () => {
    it('should validate valid request parameters', () => {
      const result = validateRequestParams(req.body);

      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('should validate request with missing topics', () => {
      const result = validateRequestParams({
        limit: 10,
        position: 'senior',
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('should validate request with missing limit', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        position: 'senior',
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: true,
        errors: [],
      });
    });

    it('should invalidate request with invalid limit', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        limit: -5,
        position: 'senior',
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Limit must be a positive integer'],
      });
    });

    it('should invalidate request with invalid topics', () => {
      const result = validateRequestParams({
        topics: 'javascript',
        limit: 10,
        position: 'senior',
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Topics must be an array'],
      });
    });

    it('should invalidate request with missing position', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        limit: 10,
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Position is required'],
      });
    });

    it('should invalidate request with invalid position', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'invalid',
        language: 'javascript',
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Position must be one of: intern, fresher, junior, middle, senior, expert'],
      });
    });

    it('should invalidate request with missing language', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'senior',
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Language is required and must be a string'],
      });
    });

    it('should invalidate request with invalid language type', () => {
      const result = validateRequestParams({
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'senior',
        language: 123,
      });

      expect(result).toEqual({
        isValid: false,
        errors: ['Language is required and must be a string'],
      });
    });
  });

  describe('formatJobsResponse', () => {
    it('should format jobs response correctly', () => {
      const jobs = [
        {
          _id: '60d21b4667d0d8992e610c85',
          type: 'question_request',
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
          otherField: 'should not be included',
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          type: 'question_request',
          status: 'completed',
          createdAt: '2023-01-02T00:00:00.000Z',
          otherField: 'should not be included',
        },
      ];

      const result = formatJobsResponse(jobs);

      expect(result).toEqual({
        jobCount: 2,
        jobs: [
          {
            _id: '60d21b4667d0d8992e610c85',
            type: 'question_request',
            status: 'pending',
            createdAt: '2023-01-01T00:00:00.000Z',
          },
          {
            _id: '60d21b4667d0d8992e610c86',
            type: 'question_request',
            status: 'completed',
            createdAt: '2023-01-02T00:00:00.000Z',
          },
        ],
      });
    });

    it('should handle empty jobs array', () => {
      const result = formatJobsResponse([]);

      expect(result).toEqual({
        jobCount: 0,
        jobs: [],
      });
    });
  });

  describe('formatSuccessResponse', () => {
    it('should format a success response correctly', () => {
      const jobs = [
        {
          _id: '60d21b4667d0d8992e610c85',
          type: 'question_request',
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      const result = formatSuccessResponse(jobs);

      expect(result).toEqual({
        success: true,
        message: 'Created 1 question request jobs',
        data: {
          jobCount: 1,
          jobs: [
            {
              _id: '60d21b4667d0d8992e610c85',
              type: 'question_request',
              status: 'pending',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
          ],
        },
      });
    });
  });

  describe('formatErrorResponse', () => {
    it('should format an error response correctly', () => {
      const error = new Error('Database connection failed');
      const result = formatErrorResponse(error);

      expect(result).toEqual({
        success: false,
        message: 'Failed to process question request',
        error: 'Database connection failed',
      });
    });
  });

  describe('formatValidationErrorResponse', () => {
    it('should format a validation error response correctly', () => {
      const errorMessage = 'Position is required';
      const result = formatValidationErrorResponse(errorMessage);

      expect(result).toEqual({
        success: false,
        message: errorMessage,
      });
    });
  });

  describe('processQuestionRequestController', () => {
    it('should process question request successfully', async () => {
      // Mock successful question request processing
      const mockJobs = [
        {
          _id: '60d21b4667d0d8992e610c85',
          type: 'question_request',
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          type: 'question_request',
          status: 'pending',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ];

      processQuestionRequest.mockResolvedValue(mockJobs);

      // Call the controller
      await processQuestionRequestController(req, res);

      // Verify service was called with correct parameters
      expect(processQuestionRequest).toHaveBeenCalledWith({
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'senior',
        language: 'javascript',
      });

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Created 2 question request jobs',
        data: {
          jobCount: 2,
          jobs: [
            {
              _id: '60d21b4667d0d8992e610c85',
              type: 'question_request',
              status: 'pending',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
            {
              _id: '60d21b4667d0d8992e610c86',
              type: 'question_request',
              status: 'pending',
              createdAt: '2023-01-01T00:00:00.000Z',
            },
          ],
        },
      });
    });

    it('should return 400 when validation fails', async () => {
      // Set invalid request body
      req.body = {
        topics: 'not-an-array',
        limit: -5,
        position: 'invalid',
        language: 'javascript',
      };

      // Call the controller
      await processQuestionRequestController(req, res);

      // Verify service was not called
      expect(processQuestionRequest).not.toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Topics must be an array',
      });
    });

    it('should return 500 when an error occurs', async () => {
      // Mock service throwing an error
      const error = new Error('Database connection failed');
      processQuestionRequest.mockRejectedValue(error);

      // Call the controller
      await processQuestionRequestController(req, res);

      // Verify service was called
      expect(processQuestionRequest).toHaveBeenCalledWith({
        topics: ['javascript', 'react'],
        limit: 10,
        position: 'senior',
        language: 'javascript',
      });

      // Verify logger was called
      expect(logger.error).toHaveBeenCalledWith('Error in question request controller:', error);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to process question request',
        error: 'Database connection failed',
      });
    });
  });
});
