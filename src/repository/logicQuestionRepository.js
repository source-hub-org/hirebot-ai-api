/**
 * Logic Question Repository Module
 * @module repository/logicQuestionRepository
 */

const LogicQuestion = require('../models/logicQuestionModel');
const logger = require('../utils/logger');

/**
 * Create a new logic question
 * @async
 * @param {Object} questionData - Data for the new question
 * @returns {Promise<Object>} Created question document
 */
async function createLogicQuestion(questionData) {
  logger.info('Creating new logic question');
  return await LogicQuestion.create(questionData);
}

/**
 * Get all logic questions with optional filtering
 * @async
 * @param {Object} filter - Filter criteria
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Promise<Array<Object>>} Array of question documents
 */
async function getLogicQuestions(filter = {}, options = {}) {
  logger.info('Retrieving logic questions with filter:', filter);

  const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

  return await LogicQuestion.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('tag_ids', 'name slug');
}

/**
 * Count logic questions with filter
 * @async
 * @param {Object} filter - Filter criteria
 * @returns {Promise<number>} Count of matching questions
 */
async function countLogicQuestions(filter = {}) {
  logger.info('Counting logic questions with filter:', filter);
  return await LogicQuestion.countDocuments(filter);
}

/**
 * Get logic question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object|null>} Question document or null if not found
 */
async function getLogicQuestionById(id) {
  logger.info(`Retrieving logic question with ID: ${id}`);
  return await LogicQuestion.findById(id).populate('tag_ids', 'name slug');
}

/**
 * Update logic question by ID
 * @async
 * @param {string} id - Question ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated question document or null if not found
 */
async function updateLogicQuestion(id, updateData) {
  logger.info(`Updating logic question with ID: ${id}`);
  return await LogicQuestion.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('tag_ids', 'name slug');
}

/**
 * Delete logic question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object|null>} Deleted question document or null if not found
 */
async function deleteLogicQuestion(id) {
  logger.info(`Deleting logic question with ID: ${id}`);
  return await LogicQuestion.findByIdAndDelete(id);
}

/**
 * Get logic questions by tag ID
 * @async
 * @param {string} tagId - Tag ID
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Promise<Array<Object>>} Array of question documents
 */
async function getLogicQuestionsByTagId(tagId, options = {}) {
  logger.info(`Retrieving logic questions with tag ID: ${tagId}`);

  const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

  return await LogicQuestion.find({ tag_ids: tagId })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('tag_ids', 'name slug');
}

/**
 * Get logic questions by level
 * @async
 * @param {number} level - Difficulty level
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Promise<Array<Object>>} Array of question documents
 */
async function getLogicQuestionsByLevel(level, options = {}) {
  logger.info(`Retrieving logic questions with level: ${level}`);

  const { sort = { createdAt: -1 }, limit = 0, skip = 0 } = options;

  return await LogicQuestion.find({ level })
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('tag_ids', 'name slug');
}

module.exports = {
  createLogicQuestion,
  getLogicQuestions,
  countLogicQuestions,
  getLogicQuestionById,
  updateLogicQuestion,
  deleteLogicQuestion,
  getLogicQuestionsByTagId,
  getLogicQuestionsByLevel,
};
