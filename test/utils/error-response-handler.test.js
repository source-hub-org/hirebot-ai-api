/**
 * Tests for the Error Response Handler
 */

const { handleApiError } = require('../../src/utils/errorResponseHandler');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('Error Response Handler', () => {
  // Mock Express request and response objects
  let req;
  let res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock request object
    req = {
      body: {
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'senior',
      },
    };

    // Mock response object
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('should handle invalid generated content errors', () => {
    const error = new Error('Invalid generated content: Failed to parse JSON');

    handleApiError(error, req, res, 'Test Context');

    // Verify logger was called
    expect(logger.error).toHaveBeenCalledWith('Error in Test Context:', error);
    expect(logger.error).toHaveBeenCalledWith(
      'Request pagination:',
      expect.objectContaining({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'senior',
        timestamp: expect.any(String),
      })
    );

    // Verify response
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to generate quiz questions.',
      details: 'The AI generated a response that could not be properly parsed as valid questions.',
      error: error.message,
    });
  });

  it('should handle Gemini API errors', () => {
    const error = new Error('Failed to generate content from Gemini API: Rate limit exceeded');

    handleApiError(error, req, res, 'Gemini Context');

    // Verify logger was called
    expect(logger.error).toHaveBeenCalledWith('Error in Gemini Context:', error);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to generate questions from AI.',
      details: 'The AI service encountered an error while processing your request.',
      error: error.message,
    });
  });

  it('should handle database errors', () => {
    const error = new Error('Database connection failed');

    handleApiError(error, req, res);

    // Verify logger was called
    expect(logger.error).toHaveBeenCalledWith('Error in API:', error);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to save questions.',
      details: 'The questions were generated successfully but could not be saved to the database.',
      error: error.message,
    });
  });

  it('should handle MongoDB errors', () => {
    const error = new Error('MongoDB validation error');

    handleApiError(error, req, res);

    // Verify logger was called
    expect(logger.error).toHaveBeenCalledWith('Error in API:', error);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Failed to save questions.',
      details: 'The questions were generated successfully but could not be saved to the database.',
      error: error.message,
    });
  });

  it('should handle generic errors', () => {
    const error = new Error('Unknown error occurred');

    handleApiError(error, req, res);

    // Verify logger was called
    expect(logger.error).toHaveBeenCalledWith('Error in API:', error);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'An unexpected error occurred.',
      details: 'The server encountered an unexpected error while processing your request.',
      error: error.message,
    });
  });

  it('should handle requests without body', () => {
    const error = new Error('Unknown error occurred');
    const reqWithoutBody = {};

    handleApiError(error, reqWithoutBody, res);

    // Verify logger was called only once (no request metadata)
    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Error in API:', error);

    // Verify response
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'An unexpected error occurred.',
      details: 'The server encountered an unexpected error while processing your request.',
      error: error.message,
    });
  });
});
