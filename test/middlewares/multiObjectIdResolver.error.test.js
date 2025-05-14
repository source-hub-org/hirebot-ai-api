/**
 * Tests for the Multi Object ID Resolver Middleware - Error Handling
 * @module test/middlewares/multiObjectIdResolver.error
 */

const multiObjectIdResolverMiddleware = require('../../src/middlewares/multiObjectIdResolver');
const objectIdResolverUtils = require('../../src/utils/objectIdResolverUtils');
const {
  createMockRequest,
  createMockResponse,
  createMockNext,
} = require('../helpers/middlewareTestHelpers');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

// Mock the resolver utility functions
jest.mock('../../src/utils/objectIdResolverUtils', () => ({
  resolveTopicData: jest.fn(),
  resolveLanguageData: jest.fn(),
  resolvePositionData: jest.fn(),
}));

describe('Multi Object ID Resolver Middleware - Error Handling', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should pass errors to next middleware', async () => {
    // Setup
    const req = createMockRequest('GET', { topic_id: 'invalid-id' });
    const res = createMockResponse();
    const next = createMockNext();
    const testError = new Error('Test error');

    // Mock the resolver to throw an error
    objectIdResolverUtils.resolveTopicData.mockRejectedValue(testError);

    // Execute
    await multiObjectIdResolverMiddleware(req, res, next);

    // Verify
    expect(next).toHaveBeenCalledWith(testError);
  });

  it('should handle invalid ObjectIds gracefully', async () => {
    // Setup
    const invalidId = 'invalid-id';
    const req = createMockRequest('GET', { topic_id: invalidId });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver to return null for invalid ID
    objectIdResolverUtils.resolveTopicData.mockResolvedValue({
      topic_id: null,
      topic: null,
    });
    objectIdResolverUtils.resolveLanguageData.mockResolvedValue({
      language_id: null,
      language: null,
    });
    objectIdResolverUtils.resolvePositionData.mockResolvedValue({
      position_id: null,
      position: null,
    });

    // Execute
    await multiObjectIdResolverMiddleware(req, res, next);

    // Verify
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledWith(req, invalidId, null);
    expect(req.query.topic_id).toBeNull();
    expect(req.query.topic).toBeNull();
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should handle empty request data', async () => {
    // Setup
    const req = createMockRequest('GET', {});
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolvers
    objectIdResolverUtils.resolveTopicData.mockResolvedValue({
      topic_id: null,
      topic: null,
    });
    objectIdResolverUtils.resolveLanguageData.mockResolvedValue({
      language_id: null,
      language: null,
    });
    objectIdResolverUtils.resolvePositionData.mockResolvedValue({
      position_id: null,
      position: null,
    });

    // Execute
    await multiObjectIdResolverMiddleware(req, res, next);

    // Verify
    expect(req.query.topic_id).toBeNull();
    expect(req.query.topic).toBeNull();
    expect(req.query.language_id).toBeNull();
    expect(req.query.language).toBeNull();
    expect(req.query.position_id).toBeNull();
    expect(req.query.position).toBeNull();
    expect(next).toHaveBeenCalled();
  });
});
