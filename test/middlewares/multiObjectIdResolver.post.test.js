/**
 * Tests for the Multi Object ID Resolver Middleware - POST Requests
 * @module test/middlewares/multiObjectIdResolver.post
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

describe('Multi Object ID Resolver Middleware - POST Requests', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process valid topic IDs in POST request', async () => {
    // Setup
    const topicId = createValidObjectId();
    const topicName = 'JavaScript';
    const req = createMockRequest('POST', { topic_id: topicId });
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
    expect(req.body.topic_id).toBe(topicId);
    expect(req.body.topic).toBe(topicName);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should process valid topic names in POST request', async () => {
    // Setup
    const topicId = createValidObjectId();
    const topicName = 'JavaScript';
    const req = createMockRequest('POST', { topic: topicName });
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledWith(req, null, topicName);
    expect(req.body.topic_id).toBe(topicId);
    expect(req.body.topic).toBe(topicName);
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should process multiple comma-separated topic IDs in POST request', async () => {
    // Setup
    const topicId1 = createValidObjectId();
    const topicId2 = createValidObjectId();
    const topicIds = `${topicId1},${topicId2}`;
    const req = createMockRequest('POST', { topic_id: topicIds });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver to return valid data
    objectIdResolverUtils.resolveTopicData.mockImplementation(async (_, id) => {
      if (id === topicId1) {
        return { topic_id: topicId1, topic: 'JavaScript' };
      } else if (id === topicId2) {
        return { topic_id: topicId2, topic: 'TypeScript' };
      }
      return { topic_id: null, topic: null };
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledTimes(2);
    expect(req.body.topic_id).toBe(`${topicId1},${topicId2}`);
    expect(req.body.topic).toBe('JavaScript,TypeScript');
    expect(next).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should process language and position data in POST request', async () => {
    // Setup
    const languageId = createValidObjectId();
    const languageName = 'Python';
    const positionId = createValidObjectId();
    const positionName = 'Backend Developer';

    const req = createMockRequest('POST', {
      language_id: languageId,
      position_id: positionId,
    });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolvers
    objectIdResolverUtils.resolveTopicData.mockResolvedValue({
      topic_id: null,
      topic: null,
    });
    objectIdResolverUtils.resolveLanguageData.mockResolvedValue({
      language_id: languageId,
      language: languageName,
    });
    objectIdResolverUtils.resolvePositionData.mockResolvedValue({
      position_id: positionId,
      position: positionName,
    });

    // Execute
    await multiObjectIdResolverMiddleware(req, res, next);

    // Verify
    expect(objectIdResolverUtils.resolveLanguageData).toHaveBeenCalledWith(req, languageId, null);
    expect(objectIdResolverUtils.resolvePositionData).toHaveBeenCalledWith(req, positionId, null);
    expect(req.body.language_id).toBe(languageId);
    expect(req.body.language).toBe(languageName);
    expect(req.body.position_id).toBe(positionId);
    expect(req.body.position).toBe(positionName);
    expect(next).toHaveBeenCalled();
  });
});
