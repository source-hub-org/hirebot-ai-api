/**
 * Tests for the job processor service module
 * @module test/jobProcessorServiceTest
 */

const { processJob } = require('../../src/service/jobProcessorService');
const { updateJobStatus, getJobById } = require('../../src/repository/jobRepository');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/utils/redisQueueHelper');
jest.mock('../../src/repository/jobRepository');
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
    payload: { topic_id: 'topic1', limit: 10 },
    status: 'new',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Set up default mock implementations
    updateJobStatus.mockResolvedValue({ ...sampleJob, status: 'processing' });
    getJobById.mockResolvedValue(sampleJob);
    logger.logToFile.mockResolvedValue();
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
        })
      );

      // Verify log file was written
      expect(logger.logToFile).toHaveBeenCalledWith(
        'question-requests.log',
        expect.stringContaining('Processed question request for topic'),
        expect.objectContaining({
          jobId: sampleJob._id,
          topicId: sampleJob.payload.topic_id,
          limit: sampleJob.payload.limit,
        })
      );

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
