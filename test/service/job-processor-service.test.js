/**
 * Tests for the job processor service module
 * @module test/jobProcessorServiceTest
 */

const { processJob } = require('../../src/service/jobProcessorService');
const { updateJobStatus, getJobById } = require('../../src/repository/jobRepository');
const logger = require('../../src/utils/logger');
const { validateGenerateRequest } = require('../../src/utils/generateRequestValidator');
const { generateAndStoreQuestions } = require('../../src/service/questionGenerationService');
const baseRepository = require('../../src/repository/baseRepository');
const { ObjectId } = require('mongodb');

// Mock dependencies
jest.mock('../../src/utils/redisQueueHelper');
jest.mock('../../src/repository/jobRepository');
jest.mock('../../src/utils/generateRequestValidator');
jest.mock('../../src/service/questionGenerationService');
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

describe('Job Processor Service Tests', () => {
  // Sample data for testing
  const sampleJob = {
    _id: '507f1f77bcf86cd799439011',
    type: 'question-request',
    payload: {
      topic_id: '680d89491cb3f55e07291e4d', // This is already a 24-character hex string
      limit: 10,
      position: 'junior',
      language: 'javascript',
    },
    status: 'new',
  };

  // Sample topic data
  const sampleTopic = {
    _id: new ObjectId('680d89491cb3f55e07291e4d'),
    title: 'JavaScript Basics',
    description: 'Fundamentals of JavaScript programming',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    updateJobStatus.mockResolvedValue({ ...sampleJob, status: 'processing' });
    getJobById.mockResolvedValue(sampleJob);
    logger.logToFile.mockResolvedValue();

    // Mock the findOne function to return the sample topic
    baseRepository.findOne = jest.fn().mockResolvedValue(sampleTopic);

    // Mock the validation and generation functions
    validateGenerateRequest.mockReturnValue({ isValid: true, errors: [] });
    generateAndStoreQuestions.mockResolvedValue();
  });

  describe('processJob', () => {
    test('should process a question-request job successfully', async () => {
      // Mock the implementation of processJob for question-request type
      // to avoid any actual waiting or timeouts
      const mockProcessedJob = { ...sampleJob, status: 'done' };
      updateJobStatus
        .mockResolvedValueOnce({ ...sampleJob, status: 'processing' }) // First call (to 'processing')
        .mockResolvedValueOnce(mockProcessedJob); // Second call (to 'done')

      const result = await processJob(sampleJob);

      // Verify job status was updated to processing
      expect(updateJobStatus).toHaveBeenCalledWith(sampleJob._id, 'processing');

      // Verify job was logged
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Processing question request job'),
        expect.objectContaining({
          topicId: sampleJob.payload.topic_id,
          limit: sampleJob.payload.limit,
          position: sampleJob.payload.position,
          language: sampleJob.payload.language,
        })
      );

      // Verify the topic was fetched
      expect(baseRepository.findOne).toHaveBeenCalledWith('topics', {
        _id: new ObjectId(sampleJob.payload.topic_id),
      });

      // Verify the validation was called with correct parameters
      expect(validateGenerateRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: sampleTopic.title,
          position: sampleJob.payload.position,
          language: sampleJob.payload.language,
        })
      );

      // Verify the generation function was called
      expect(generateAndStoreQuestions).toHaveBeenCalled();

      // Verify job status was updated to done
      expect(updateJobStatus).toHaveBeenCalledWith(sampleJob._id, 'done');

      // Verify the result
      expect(result).toBe(true);
    });

    test('should handle unknown job types', async () => {
      const unknownTypeJob = {
        ...sampleJob,
        type: 'unknown-type',
      };

      const result = await processJob(unknownTypeJob);

      // Verify warning was logged
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown job type'),
        expect.objectContaining({ jobId: unknownTypeJob._id })
      );

      // Verify job status was updated to failed
      expect(updateJobStatus).toHaveBeenCalledWith(unknownTypeJob._id, 'failed');

      // Verify the result
      expect(result).toBe(false);
    });

    test('should handle errors during processing', async () => {
      // Mock updateJobStatus to throw an error on first call
      updateJobStatus.mockRejectedValueOnce(new Error('Database error'));

      const result = await processJob(sampleJob);

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining(`Error processing job ${sampleJob._id}`),
        expect.any(Error)
      );

      // Verify job status was updated to failed
      expect(updateJobStatus).toHaveBeenCalledWith(sampleJob._id, 'failed');

      // Verify the result
      expect(result).toBe(false);
    });
  });
});
