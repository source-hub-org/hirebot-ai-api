/**
 * Tests for the job repository module
 * @module test/jobRepositoryTest
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Job = require('../../src/models/jobModel');
const {
  createJob,
  getJobById,
  updateJobStatus,
  deleteJob,
  getJobsByTypeAndStatus,
} = require('../../src/repository/jobRepository');

// Mock the logger to prevent console output during tests
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  logToFile: jest.fn(),
}));

describe('Job Repository Tests', () => {
  let mongoServer;
  let mongoUri;

  // Sample job data for testing
  const sampleJobData = {
    type: 'question-request',
    payload: { topic_id: 'topic123', limit: 10 },
    status: 'new',
  };

  // Set up in-memory MongoDB server before all tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  // Close connections after all tests
  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  // Clean up the database before each test
  beforeEach(async () => {
    await Job.deleteMany({});
  });

  describe('createJob', () => {
    test('should create a new job successfully', async () => {
      const job = await createJob(sampleJobData);

      expect(job).toBeDefined();
      expect(job._id).toBeDefined();
      expect(job.type).toBe(sampleJobData.type);
      expect(job.payload).toEqual(sampleJobData.payload);
      expect(job.status).toBe(sampleJobData.status);
      expect(job.createdAt).toBeDefined();
      expect(job.updatedAt).toBeDefined();
    });

    test('should throw an error if job data is invalid', async () => {
      const invalidJobData = {
        // Missing required 'type' field
        payload: { topic_id: 'topic123', limit: 10 },
      };

      await expect(createJob(invalidJobData)).rejects.toThrow();
    });
  });

  describe('getJobById', () => {
    test('should retrieve a job by its ID', async () => {
      // Create a job first
      const createdJob = await createJob(sampleJobData);

      // Retrieve the job by ID
      const retrievedJob = await getJobById(createdJob._id);

      expect(retrievedJob).toBeDefined();
      expect(retrievedJob._id.toString()).toBe(createdJob._id.toString());
      expect(retrievedJob.type).toBe(sampleJobData.type);
    });

    test('should return null for non-existent job ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const job = await getJobById(nonExistentId);

      expect(job).toBeNull();
    });

    test('should throw an error for invalid job ID format', async () => {
      await expect(getJobById('invalid-id')).rejects.toThrow();
    });
  });

  describe('updateJobStatus', () => {
    test('should update a job status successfully', async () => {
      // Create a job first
      const createdJob = await createJob(sampleJobData);

      // Update the job status
      const updatedJob = await updateJobStatus(createdJob._id, 'processing');

      expect(updatedJob).toBeDefined();
      expect(updatedJob.status).toBe('processing');
      expect(updatedJob._id.toString()).toBe(createdJob._id.toString());
    });

    test('should return null for non-existent job ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await updateJobStatus(nonExistentId, 'processing');

      expect(result).toBeNull();
    });

    test('should throw an error for invalid status value', async () => {
      const createdJob = await createJob(sampleJobData);

      await expect(updateJobStatus(createdJob._id, 'invalid-status')).rejects.toThrow();
    });
  });

  describe('deleteJob', () => {
    test('should delete a job successfully', async () => {
      // Create a job first
      const createdJob = await createJob(sampleJobData);

      // Delete the job
      const deletedJob = await deleteJob(createdJob._id);

      expect(deletedJob).toBeDefined();
      expect(deletedJob._id.toString()).toBe(createdJob._id.toString());

      // Verify the job is deleted
      const retrievedJob = await getJobById(createdJob._id);
      expect(retrievedJob).toBeNull();
    });

    test('should return null for non-existent job ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const result = await deleteJob(nonExistentId);

      expect(result).toBeNull();
    });
  });

  describe('getJobsByTypeAndStatus', () => {
    beforeEach(async () => {
      // Create multiple jobs with different types and statuses
      await createJob({
        type: 'question-request',
        payload: { topic_id: 'topic1', limit: 10 },
        status: 'new',
      });

      await createJob({
        type: 'question-request',
        payload: { topic_id: 'topic2', limit: 5 },
        status: 'processing',
      });

      await createJob({
        type: 'question-request',
        payload: { topic_id: 'topic3', limit: 15 },
        status: 'done',
      });

      await createJob({
        type: 'other-type',
        payload: { data: 'test' },
        status: 'new',
      });
    });

    test('should retrieve jobs by type only', async () => {
      const jobs = await getJobsByTypeAndStatus('question-request');

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(3);
      expect(jobs.every(job => job.type === 'question-request')).toBe(true);
    });

    test('should retrieve jobs by type and status', async () => {
      const jobs = await getJobsByTypeAndStatus('question-request', 'new');

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(1);
      expect(jobs[0].type).toBe('question-request');
      expect(jobs[0].status).toBe('new');
    });

    test('should return empty array for non-existent type', async () => {
      const jobs = await getJobsByTypeAndStatus('non-existent-type');

      expect(jobs).toBeDefined();
      expect(Array.isArray(jobs)).toBe(true);
      expect(jobs.length).toBe(0);
    });
  });
});
