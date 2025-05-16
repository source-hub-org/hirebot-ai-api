/**
 * Tests for the question request service module
 * @module test/questionRequestServiceTest
 */

const { processQuestionRequest } = require('../../src/services/questionRequestService');
const { createJob } = require('../../src/repository/jobRepository');
const { addToQueue } = require('../../src/utils/redisQueueHelper');
const { findMany } = require('../../src/repository/baseRepository');

// Mock dependencies
jest.mock('../../src/repository/jobRepository');
jest.mock('../../src/utils/redisQueueHelper');
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

describe('Question Request Service Tests', () => {
  // Sample data for testing
  const sampleTopics = [
    { _id: 'topic1', title: 'Topic 1' },
    { _id: 'topic2', title: 'Topic 2' },
    { _id: 'topic3', title: 'Topic 3' },
  ];

  const sampleJob = {
    _id: '507f1f77bcf86cd799439011',
    type: 'question-request',
    payload: { topic_id: 'topic1', limit: 10 },
    status: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    createJob.mockResolvedValue(sampleJob);
    addToQueue.mockResolvedValue(1);
    findMany.mockResolvedValue(sampleTopics);
  });

  describe('processQuestionRequest', () => {
    test('should process request with specific topics', async () => {
      const requestData = {
        topics: ['topic1', 'topic2'],
        limit: 5,
      };

      const result = await processQuestionRequest(requestData);

      // Verify jobs were created for each topic
      expect(createJob).toHaveBeenCalledTimes(2);
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic1', limit: 5 },
        status: 'new',
      });
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic2', limit: 5 },
        status: 'new',
      });

      // Verify jobs were added to the queue
      expect(addToQueue).toHaveBeenCalledTimes(2);
      expect(addToQueue).toHaveBeenCalledWith({
        _id: sampleJob._id.toString(),
        type: sampleJob.type,
        payload: sampleJob.payload,
      });

      // Verify the result
      expect(result).toEqual([sampleJob, sampleJob]);
    });

    test('should fetch all topics when none are provided', async () => {
      const requestData = {
        topics: [],
        limit: 10,
      };

      const result = await processQuestionRequest(requestData);

      // Verify all topics were fetched
      expect(findMany).toHaveBeenCalledWith('topics', {});

      // Verify jobs were created for each topic
      expect(createJob).toHaveBeenCalledTimes(3);
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic1', limit: 10 },
        status: 'new',
      });
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic2', limit: 10 },
        status: 'new',
      });
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic3', limit: 10 },
        status: 'new',
      });

      // Verify jobs were added to the queue
      expect(addToQueue).toHaveBeenCalledTimes(3);

      // Verify the result
      expect(result).toEqual([sampleJob, sampleJob, sampleJob]);
    });

    test('should use default limit when not provided', async () => {
      const requestData = {
        topics: ['topic1'],
      };

      await processQuestionRequest(requestData);

      // Verify job was created with default limit
      expect(createJob).toHaveBeenCalledWith({
        type: 'question-request',
        payload: { topic_id: 'topic1', limit: 10 },
        status: 'new',
      });
    });

    test('should handle errors during processing', async () => {
      // Mock createJob to throw an error
      createJob.mockRejectedValue(new Error('Database error'));

      const requestData = {
        topics: ['topic1'],
        limit: 5,
      };

      // Verify the error is propagated
      await expect(processQuestionRequest(requestData)).rejects.toThrow('Database error');
    });
  });
});
