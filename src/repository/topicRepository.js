/**
 * Topic Repository Module
 * @module repository/topicRepository
 */

const { ObjectId } = require('mongodb');
const { getCollection, deleteMany, insertMany, findMany, findOne } = require('./baseRepository');
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

/**
 * Get a topic by ID
 * @async
 * @param {string} id - Topic ID
 * @returns {Promise<Object|null>} Topic object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getTopicById(id) {
  try {
    logger.info(`Retrieving topic with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid topic ID format: ${id}`);
      return null;
    }

    return await findOne(TOPICS_COLLECTION, { _id: new ObjectId(id) });
  } catch (error) {
    logger.error(`Error retrieving topic with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get a topic by title
 * @async
 * @param {string} title - Topic title
 * @returns {Promise<Object|null>} Topic object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getTopicByTitle(title) {
  try {
    logger.info(`Retrieving topic with title: ${title}`);
    return await findOne(TOPICS_COLLECTION, { title });
  } catch (error) {
    logger.error(`Error retrieving topic with title ${title}:`, error);
    throw error;
  }
}

module.exports = {
  clearAllTopics,
  insertTopics,
  getAllTopics,
  getTopicById,
  getTopicByTitle,
};
