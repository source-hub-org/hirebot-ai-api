/**
 * Job Repository Module for MongoDB Operations
 * @module repository/jobRepository
 */

const Job = require('../models/jobModel');
const logger = require('../utils/logger');

/**
 * Create a new job in the database
 * @async
 * @param {Object} jobData - Job data to create
 * @param {string} jobData.type - Type of the job
 * @param {Object} jobData.payload - Payload data for the job
 * @param {string} [jobData.status='new'] - Status of the job
 * @returns {Promise<Object>} Created job document
 * @throws {Error} If job creation fails
 */
async function createJob(jobData) {
  try {
    const job = new Job(jobData);
    await job.save();
    logger.info(`Job created with ID: ${job._id}`, { type: job.type });
    return job;
  } catch (error) {
    logger.error('Failed to create job:', error);
    throw error;
  }
}

/**
 * Get a job by its ID
 * @async
 * @param {string} jobId - ID of the job to retrieve
 * @returns {Promise<Object|null>} Job document or null if not found
 * @throws {Error} If retrieval fails
 */
async function getJobById(jobId) {
  try {
    const job = await Job.findById(jobId);
    return job;
  } catch (error) {
    logger.error(`Failed to get job with ID: ${jobId}`, error);
    throw error;
  }
}

/**
 * Update a job's status
 * @async
 * @param {string} jobId - ID of the job to update
 * @param {string} status - New status for the job
 * @returns {Promise<Object|null>} Updated job document or null if not found
 * @throws {Error} If update fails
 */
async function updateJobStatus(jobId, status) {
  try {
    const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true, runValidators: true });

    if (job) {
      logger.info(`Job ${jobId} status updated to: ${status}`);
    } else {
      logger.warn(`Job ${jobId} not found for status update`);
    }

    return job;
  } catch (error) {
    logger.error(`Failed to update job ${jobId} status to ${status}:`, error);
    throw error;
  }
}

/**
 * Delete a job by its ID
 * @async
 * @param {string} jobId - ID of the job to delete
 * @returns {Promise<Object|null>} Deleted job document or null if not found
 * @throws {Error} If deletion fails
 */
async function deleteJob(jobId) {
  try {
    const job = await Job.findByIdAndDelete(jobId);

    if (job) {
      logger.info(`Job ${jobId} deleted successfully`);
    } else {
      logger.warn(`Job ${jobId} not found for deletion`);
    }

    return job;
  } catch (error) {
    logger.error(`Failed to delete job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get jobs by type and status
 * @async
 * @param {string} type - Type of jobs to retrieve
 * @param {string} [status] - Status of jobs to retrieve (optional)
 * @returns {Promise<Array<Object>>} Array of job documents
 * @throws {Error} If retrieval fails
 */
async function getJobsByTypeAndStatus(type, status) {
  try {
    const query = { type };
    if (status) {
      query.status = status;
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 });
    return jobs;
  } catch (error) {
    logger.error(`Failed to get jobs by type: ${type} and status: ${status}`, error);
    throw error;
  }
}

module.exports = {
  createJob,
  getJobById,
  updateJobStatus,
  deleteJob,
  getJobsByTypeAndStatus,
};
