/**
 * Tests for the Multi Object ID Resolver Middleware - Basic GET Requests
 * @module test/middlewares/multiObjectIdResolver.get-basic
 */

const multiObjectIdResolverMiddleware = require('../../src/middlewares/multiObjectIdResolver');
const objectIdResolverUtils = require('../../src/utils/objectIdResolverUtils');
const {
  createMockRequest,
  createMockResponse,
  createValidObjectId,
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

describe('Multi Object ID Resolver Middleware - Basic GET Requests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid topic IDs in GET request', async () => {
    // Setup
    const topicId = createValidObjectId();
    const topicName = 'JavaScript';
    const req = createMockRequest('GET', { topic_id: topicId });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver to return valid data
    objectIdResolverUtils.resolveTopicData.mockResolvedValue({
      topic_id: topicId,
      topic: topicName,
    });

    // Other resolvers return empty results
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledWith(req, topicId, null);
    expect(req.query.topic_id).toBe(topicId);
    expect(req.query.topic).toBe(topicName);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should process multiple comma-separated language names in GET request', async () => {
    // Setup
    const languageNames = 'Python,JavaScript,TypeScript';
    const languageId1 = createValidObjectId();
    const languageId2 = createValidObjectId();
    const languageId3 = createValidObjectId();

    const req = createMockRequest('GET', { language: languageNames });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolvers
    objectIdResolverUtils.resolveTopicData.mockResolvedValue({
      topic_id: null,
      topic: null,
    });

    // Mock language resolver to handle different names
    objectIdResolverUtils.resolveLanguageData.mockImplementation(async (req, id, name) => {
      if (name === 'Python') {
        return { language_id: languageId1, language: 'Python' };
      } else if (name === 'JavaScript') {
        return { language_id: languageId2, language: 'JavaScript' };
      } else if (name === 'TypeScript') {
        return { language_id: languageId3, language: 'TypeScript' };
      }
      return { language_id: null, language: null };
    });

    objectIdResolverUtils.resolvePositionData.mockResolvedValue({
      position_id: null,
      position: null,
    });

    // Execute
    await multiObjectIdResolverMiddleware(req, res, next);

    // Verify
    expect(objectIdResolverUtils.resolveLanguageData).toHaveBeenCalledTimes(3);
    expect(req.query.language_id).toBe(`${languageId1},${languageId2},${languageId3}`);
    expect(req.query.language).toBe('Python,JavaScript,TypeScript');
    expect(next).toHaveBeenCalled();
  });
});
