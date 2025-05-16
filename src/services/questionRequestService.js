/**
 * Question Request Service
 * @module service/questionRequestService
 */

const { createJob } = require('../repository/jobRepository');
const { addToQueue } = require('../utils/redisQueueHelper');
const { findMany } = require('../repository/baseRepository');
const logger = require('../utils/logger');

/**
 * Process a question request
 * @async
 * @param {Object} requestData - Request data
 * @param {Array<string>} [requestData.topics=[]] - Array of topic IDs
 * @param {number} [requestData.limit=10] - Limit of questions per topic
 * @param {string} requestData.position - Position level (intern, fresher, junior, middle, senior, expert)
 * @param {string} requestData.language - Programming language
 * @returns {Promise<Array<Object>>} Array of created jobs
 * @throws {Error} If processing fails
 */
async function processQuestionRequest(requestData) {
  try {
    const { topics = [], limit = 10, position, language } = requestData;
    const createdJobs = [];

    // If topics array is empty, retrieve all topics from MongoDB
    let topicsToProcess = topics;
    if (topics.length === 0) {
      const allTopics = await findMany('topics', {});
      topicsToProcess = allTopics.map(topic => topic._id.toString());
    }

    // Process each topic
    for (const topicId of topicsToProcess) {
      // Create job in MongoDB
      const jobData = {
        type: 'question-request',
        payload: {
          topic_id: topicId,
          limit,
          position,
          language,
        },
        status: 'new',
      };

      const job = await createJob(jobData);

      // Add to Redis queue
      await addToQueue({
        _id: job._id.toString(),
        type: job.type,
        payload: job.payload,
      });

      createdJobs.push(job);
    }

    logger.info(`Created ${createdJobs.length} question request jobs`);
    return createdJobs;
  } catch (error) {
    logger.error('Failed to process question request:', error);
    throw error;
  }
}

module.exports = {
  processQuestionRequest,
};
