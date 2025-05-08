/**
 * Question Repository Module
 * @module repository/questionRepository
 */

const { ObjectId } = require('mongodb');
const {
  insertOne,
  findOne,
  findMany,
  updateOne,
  deleteOne,
  getCollection,
} = require('./baseRepository');
const logger = require('../utils/logger');

/**
 * Collection name for questions
 * @type {string}
 */
const COLLECTION_NAME = 'questions';

/**
 * Create a new question
 * @async
 * @param {Object} questionData - Question data to insert
 * @returns {Promise<Object>} Created question document
 * @throws {Error} If insertion fails
 */
async function createQuestion(questionData) {
  try {
    // Add createdAt timestamp if not provided
    if (!questionData.createdAt) {
      questionData.createdAt = new Date();
    }

    const result = await insertOne(COLLECTION_NAME, questionData);

    if (!result.acknowledged) {
      throw new Error('Failed to create question');
    }

    // Retrieve the created question with its ID
    return await findOne(COLLECTION_NAME, { _id: result.insertedId });
  } catch (error) {
    logger.error('Error in createQuestion repository:', error);
    throw error;
  }
}

/**
 * Get a question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object|null>} Question document or null if not found
 * @throws {Error} If retrieval fails
 */
async function getQuestionById(id) {
  try {
    // Validate and convert ID to ObjectId
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await findOne(COLLECTION_NAME, { _id: new ObjectId(id) });
  } catch (error) {
    logger.error(`Error in getQuestionById repository for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a question by ID
 * @async
 * @param {string} id - Question ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated question document or null if not found
 * @throws {Error} If update fails
 */
async function updateQuestionById(id, updateData) {
  try {
    // Validate and convert ID to ObjectId
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const objectId = new ObjectId(id);

    // Remove _id from update data if present
    if (updateData._id) {
      delete updateData._id;
    }

    const result = await updateOne(COLLECTION_NAME, { _id: objectId }, { $set: updateData });

    if (!result.acknowledged) {
      throw new Error(`Failed to update question with ID ${id}`);
    }

    if (result.matchedCount === 0) {
      return null; // No document matched the ID
    }

    // Retrieve and return the updated question
    return await findOne(COLLECTION_NAME, { _id: objectId });
  } catch (error) {
    logger.error(`Error in updateQuestionById repository for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<boolean>} True if deletion was successful, false if question not found
 * @throws {Error} If deletion fails
 */
async function deleteQuestionById(id) {
  try {
    // Validate and convert ID to ObjectId
    if (!ObjectId.isValid(id)) {
      return false;
    }

    const result = await deleteOne(COLLECTION_NAME, { _id: new ObjectId(id) });

    if (!result.acknowledged) {
      throw new Error(`Failed to delete question with ID ${id}`);
    }

    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error in deleteQuestionById repository for ID ${id}:`, error);
    throw error;
  }
}

module.exports = {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
};
