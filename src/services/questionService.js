/**
 * Question Service Module
 * @module service/questionService
 */

const {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
} = require('../repository/questionRepository');
const logger = require('../utils/logger');

/**
 * Create a new question
 * @async
 * @param {Object} questionData - Question data to create
 * @returns {Promise<Object>} Created question
 * @throws {Error} If creation fails
 */
async function createNewQuestion(questionData) {
  try {
    // Normalize data before saving
    const normalizedData = normalizeQuestionData(questionData);

    // Create the question
    const createdQuestion = await createQuestion(normalizedData);
    return createdQuestion;
  } catch (error) {
    logger.error('Error in createNewQuestion service:', error);
    throw error;
  }
}

/**
 * Get a question by ID
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object|null>} Question object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getQuestion(id) {
  try {
    return await getQuestionById(id);
  } catch (error) {
    logger.error(`Error in getQuestion service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a question by ID
 * @async
 * @param {string} id - Question ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated question or null if not found
 * @throws {Error} If update fails
 */
async function updateQuestion(id, updateData) {
  try {
    // Normalize data before updating
    const normalizedData = normalizeQuestionData(updateData);

    // Update the question
    return await updateQuestionById(id, normalizedData);
  } catch (error) {
    logger.error(`Error in updateQuestion service for ID ${id}:`, error);
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
async function deleteQuestion(id) {
  try {
    return await deleteQuestionById(id);
  } catch (error) {
    logger.error(`Error in deleteQuestion service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Normalize question data by trimming strings and ensuring correct types
 * @param {Object} data - Question data to normalize
 * @returns {Object} Normalized question data
 */
function normalizeQuestionData(data) {
  const normalized = { ...data };

  // Trim string fields
  const stringFields = [
    'question',
    'explanation',
    'difficulty',
    'category',
    'topic',
    'language',
    'position',
  ];
  stringFields.forEach(field => {
    if (normalized[field] && typeof normalized[field] === 'string') {
      normalized[field] = normalized[field].trim();
    }
  });

  // Normalize options array
  if (normalized.options && Array.isArray(normalized.options)) {
    normalized.options = normalized.options.map(option =>
      typeof option === 'string' ? option.trim() : option
    );
  }

  // Ensure numeric fields are numbers
  if (normalized.correctAnswer !== undefined && normalized.correctAnswer !== null) {
    normalized.correctAnswer = Number(normalized.correctAnswer);
  }

  if (normalized.positionLevel !== undefined && normalized.positionLevel !== null) {
    normalized.positionLevel = Number(normalized.positionLevel);
  }

  // Ensure difficulty is lowercase
  if (normalized.difficulty) {
    normalized.difficulty = normalized.difficulty.toLowerCase();
  }

  return normalized;
}

module.exports = {
  createNewQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
};
