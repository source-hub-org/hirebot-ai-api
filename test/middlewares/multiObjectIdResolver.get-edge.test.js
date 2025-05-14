/**
 * Tests for the Multi Object ID Resolver Middleware - GET Edge Cases
 * @module test/middlewares/multiObjectIdResolver.get-edge
 */

const multiObjectIdResolverMiddleware = require('../../src/middlewares/multiObjectIdResolver');
const objectIdResolverUtils = require('../../src/utils/objectIdResolverUtils');
const {
  createMockRequest,
  createMockResponse,
  createValidObjectId,
  createInvalidObjectId,
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

describe('Multi Object ID Resolver Middleware - GET Edge Cases', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle mixed valid and invalid IDs in comma-separated list', async () => {
    // Setup
    const validId = createValidObjectId();
    const invalidId = createInvalidObjectId();
    const mixedIds = `${validId},${invalidId}`;

    const req = createMockRequest('GET', { topic_id: mixedIds });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver to handle different IDs
    objectIdResolverUtils.resolveTopicData.mockImplementation(async (_, id) => {
      if (id === validId) {
        return { topic_id: validId, topic: 'JavaScript' };
      } else if (id === invalidId) {
        return { topic_id: null, topic: null };
      }
      return { topic_id: null, topic: null };
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledTimes(2);
    expect(req.query.topic_id).toBe(validId);
    expect(req.query.topic).toBe('JavaScript');
    expect(next).toHaveBeenCalled();
  });

  it('should handle empty strings in comma-separated list', async () => {
    // Setup
    const validId = createValidObjectId();
    const emptyList = `${validId},,,`;

    const req = createMockRequest('GET', { topic_id: emptyList });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver
    objectIdResolverUtils.resolveTopicData.mockImplementation(async (_, id) => {
      if (id === validId) {
        return { topic_id: validId, topic: 'JavaScript' };
      } else if (id === '') {
        return { topic_id: null, topic: null };
      }
      return { topic_id: null, topic: null };
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
    // Only the valid ID should be processed, empty strings should be ignored
    expect(req.query.topic_id).toBe(validId);
    expect(req.query.topic).toBe('JavaScript');
    expect(next).toHaveBeenCalled();
  });

  it('should handle whitespace in comma-separated list', async () => {
    // Setup
    const validId1 = createValidObjectId();
    const validId2 = createValidObjectId();
    const listWithSpaces = ` ${validId1} , ${validId2} `;

    const req = createMockRequest('GET', { topic_id: listWithSpaces });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver
    objectIdResolverUtils.resolveTopicData.mockImplementation(async (_, id) => {
      if (id === validId1) {
        return { topic_id: validId1, topic: 'JavaScript' };
      } else if (id === validId2) {
        return { topic_id: validId2, topic: 'TypeScript' };
      }
      return { topic_id: null, topic: null };
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledTimes(2);
    expect(req.query.topic_id).toBe(`${validId1},${validId2}`);
    expect(req.query.topic).toBe('JavaScript,TypeScript');
    expect(next).toHaveBeenCalled();
  });

  it('should remove duplicate IDs and names', async () => {
    // Setup
    const validId = createValidObjectId();
    const duplicateIds = `${validId},${validId},${validId}`;

    const req = createMockRequest('GET', { topic_id: duplicateIds });
    const res = createMockResponse();
    const next = createMockNext();

    // Mock the resolver
    objectIdResolverUtils.resolveTopicData.mockImplementation(async (_, id) => {
      if (id === validId) {
        return { topic_id: validId, topic: 'JavaScript' };
      }
      return { topic_id: null, topic: null };
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
    expect(objectIdResolverUtils.resolveTopicData).toHaveBeenCalledTimes(3);
    // Duplicates should be removed
    expect(req.query.topic_id).toBe(validId);
    expect(req.query.topic).toBe('JavaScript');
    expect(next).toHaveBeenCalled();
  });
});
