/**
 * Topic Repository Module
 * @module repository/topicRepository
 */

const { getCollection, deleteMany, insertMany, findMany } = require('./baseRepository');
const logger = require('../utils/logger');

// Collection name for topics
const TOPICS_COLLECTION = 'topics';

/**
 * Clear all topics from the database
 * @async
 * @returns {Promise<import('mongodb').DeleteResult>} Result of the delete operation
 */
async function clearAllTopics() {
  logger.info('Clearing all topics from the database');
  return await deleteMany(TOPICS_COLLECTION, {});
}

/**
 * Insert multiple topics into the database
 * @async
 * @param {Array<Object>} topics - Array of topic objects to insert
 * @returns {Promise<import('mongodb').InsertManyResult|Object>} Result of the insert operation
 */
async function insertTopics(topics) {
  logger.info(`Inserting ${topics.length} topics into the database`);

  // Handle empty array case
  if (!topics || topics.length === 0) {
    return { acknowledged: true, insertedCount: 0 };
  }

  return await insertMany(TOPICS_COLLECTION, topics);
}

/**
 * Get all topics from the database
 * @async
 * @returns {Promise<Array<Object>>} Array of topic objects
 */
async function getAllTopics() {
  logger.info('Retrieving all topics from the database');
  return await findMany(TOPICS_COLLECTION, {});
}

module.exports = {
  clearAllTopics,
  insertTopics,
  getAllTopics,
};
