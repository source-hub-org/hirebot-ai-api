/**
 * Job Processor Service
 * @module service/jobProcessorService
 */

const { getFromQueue, DEFAULT_QUEUE } = require('../utils/redisQueueHelper');
const { updateJobStatus, getJobById } = require('../repository/jobRepository');
const { validateGenerateRequest } = require('../utils/generateRequestValidator');
const { generateAndStoreQuestions } = require('../services/questionGenerationService');
const logger = require('../utils/logger');
const { ObjectId } = require('mongodb');

/**
 * Flag to control the job processor loop
 * @type {boolean}
 */
let isProcessing = false;

/**
 * Process a job based on its type
 * @async
 * @param {Object} job - Job to process
 * @returns {Promise<boolean>} True if job was processed successfully
 * @throws {Error} If job processing fails
 */
async function processJob(job) {
  try {
    // Update job status to processing
    await updateJobStatus(job._id, 'processing');

    // Process based on job type
    switch (job.type) {
      case 'question-request':
        await processQuestionRequest(job);
        break;
      // Add more job types here as needed
      default:
        logger.warn(`Unknown job type: ${job.type}`, { jobId: job._id });
        await updateJobStatus(job._id, 'failed');
        return false;
    }

    // Update job status to done
    await updateJobStatus(job._id, 'done');
    return true;
  } catch (error) {
    logger.error(`Error processing job ${job._id}:`, error);
    // Update job status to failed
    await updateJobStatus(job._id, 'failed');
    return false;
  }
}

/**
 * Process a question request job
 * @async
 * @param {Object} job - Question request job
 * @returns {Promise<void>}
 */
async function processQuestionRequest(job) {
  const payload = {
    jobId: job._id,
    topicId: job.payload.topic_id,
    topic: '',
    limit: job.payload.limit,
    position: job.payload.position,
    language: job.payload.language,
    timestamp: new Date().toISOString(),
  };

  // Log the job information
  logger.info(`Processing question request job: ${job._id}`, payload);

  try {
    // 1. Find the topic by ID to get its title
    const { findOne } = require('../repository/baseRepository');
    const topic = await findOne('topics', { _id: new ObjectId(job.payload.topic_id) });

    if (!topic) {
      throw new Error(`Topic with ID ${job.payload.topic_id} not found`);
    }

    // 2. Update payload with required parameters
    payload.topic = topic.title;

    // 3. Validate the payload
    const validation = validateGenerateRequest(payload);

    if (validation.isValid) {
      // 4. Generate and store questions
      await generateAndStoreQuestions(payload);

      // 5. Log to a specific file for question requests
      await logger.logToFile(
        'question-requests.log',
        `Processed question request for topic: ${topic.title}`,
        {
          jobId: job._id,
          topicId: job.payload.topic_id,
          limit: job.payload.limit,
          position: job.payload.position,
          language: job.payload.language,
          timestamp: new Date().toISOString(),
        }
      );
    } else {
      throw new Error(`Invalid payload: ${validation.errors.join(', ')}`);
    }
  } catch (error) {
    logger.error(`Error processing job ${job._id}:`, error);
    throw error; // Re-throw to be caught by the calling function
  }
}

/**
 * Start the job processor
 * @async
 * @param {Object} [options={}] - Processor options
 * @param {number} [options.pollingInterval=5000] - Polling interval in milliseconds
 * @param {string} [options.queueName=DEFAULT_QUEUE] - Name of the queue to process
 * @returns {Promise<void>}
 */
async function startJobProcessor(options = {}) {
  const pollingInterval = options.pollingInterval || 5000;
  const queueName = options.queueName || DEFAULT_QUEUE;

  if (isProcessing) {
    logger.warn('Job processor is already running');
    return;
  }

  isProcessing = true;
  logger.info(`Starting job processor for queue: ${queueName}`);

  // Start the processing loop
  while (isProcessing) {
    try {
      // Get a job from the queue
      const queueItem = await getFromQueue(queueName);

      if (queueItem) {
        logger.info(`Processing job from queue: ${queueItem._id}`);

        // Get the full job from MongoDB
        const job = await getJobById(queueItem._id);

        if (job) {
          await processJob(job);
        } else {
          logger.warn(`Job not found in database: ${queueItem._id}`);
        }
      }

      // Wait before checking for more jobs
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    } catch (error) {
      logger.error('Error in job processor loop:', error);
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }
  }
}

/**
 * Stop the job processor
 * @returns {void}
 */
function stopJobProcessor() {
  if (isProcessing) {
    isProcessing = false;
    logger.info('Stopping job processor');
  }
}

module.exports = {
  startJobProcessor,
  stopJobProcessor,
  processJob,
};
