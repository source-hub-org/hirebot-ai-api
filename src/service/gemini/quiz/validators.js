/**
 * @fileoverview Validators for quiz question generation.
 * This module handles validating question structure.
 */

const logger = require('@utils/logger');

/**
 * Validates that a question has the required 'question' field
 *
 * @param {Object} question - The question to validate
 * @param {number} index - The index of the question
 * @throws {Error} If validation fails
 */
function validateQuestionField(question, index) {
  if (!question.question) {
    throw new Error(`Question ${index + 1} is missing the 'question' field`);
  }
}

/**
 * Validates that a question has a valid options array
 *
 * @param {Object} question - The question to validate
 * @param {number} index - The index of the question
 * @throws {Error} If validation fails
 */
function validateOptionsArray(question, index) {
  if (!Array.isArray(question.options)) {
    throw new Error(`Question ${index + 1} has invalid or missing 'options' array`);
  }
}

/**
 * Ensures a question has exactly 4 options
 *
 * @param {Object} question - The question to validate and potentially fix
 * @param {number} index - The index of the question
 * @param {boolean} strictMode - Whether to use strict mode
 * @throws {Error} If validation fails in strict mode
 */
function ensureFourOptions(question, index, strictMode) {
  if (question.options.length !== 4) {
    if (strictMode) {
      throw new Error(`Question ${index + 1} must have exactly 4 options`);
    } else {
      logger.warn(`Question ${index + 1} has ${question.options.length} options instead of 4`);

      // If we have fewer than 4 options, add placeholder options
      while (question.options.length < 4) {
        question.options.push(`Option ${question.options.length + 1} (placeholder)`);
      }

      // If we have more than 4 options, truncate
      if (question.options.length > 4) {
        question.options = question.options.slice(0, 4);
      }
    }
  }
}

/**
 * Validates that a question has a valid correctAnswer field
 *
 * @param {Object} question - The question to validate and potentially fix
 * @param {number} index - The index of the question
 * @param {boolean} strictMode - Whether to use strict mode
 * @throws {Error} If validation fails in strict mode
 */
function validateCorrectAnswer(question, index, strictMode) {
  const isValidCorrectAnswer =
    typeof question.correctAnswer === 'number' &&
    question.correctAnswer >= 0 &&
    question.correctAnswer <= 3 &&
    Number.isInteger(question.correctAnswer);

  if (!isValidCorrectAnswer) {
    if (strictMode) {
      throw new Error(`Question ${index + 1} has an invalid 'correctAnswer' (must be 0-3)`);
    } else {
      logger.warn(`Question ${index + 1} has invalid 'correctAnswer': ${question.correctAnswer}`);

      // Try to convert string to number if possible
      if (typeof question.correctAnswer === 'string') {
        const parsed = parseInt(question.correctAnswer, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 3) {
          question.correctAnswer = parsed;
          logger.info(`Converted string correctAnswer to number: ${parsed}`);
        } else {
          // Default to first option
          question.correctAnswer = 0;
          logger.warn(`Set default correctAnswer to 0 for question ${index + 1}`);
        }
      } else {
        // Default to first option
        question.correctAnswer = 0;
        logger.warn(`Set default correctAnswer to 0 for question ${index + 1}`);
      }
    }
  }
}

/**
 * Ensures a question has an explanation field
 *
 * @param {Object} question - The question to validate and potentially fix
 * @param {number} index - The index of the question
 * @param {boolean} strictMode - Whether to use strict mode
 * @throws {Error} If validation fails in strict mode
 */
function ensureExplanation(question, index, strictMode) {
  if (!question.explanation) {
    if (strictMode) {
      throw new Error(`Question ${index + 1} is missing the 'explanation' field`);
    } else {
      logger.warn(`Question ${index + 1} is missing the 'explanation' field`);
      question.explanation = `The correct answer is option ${question.correctAnswer + 1}.`;
    }
  }
}

/**
 * Validates that a question has a valid difficulty field
 *
 * @param {Object} question - The question to validate and potentially fix
 * @param {number} index - The index of the question
 * @param {boolean} strictMode - Whether to use strict mode
 * @throws {Error} If validation fails in strict mode
 */
function validateDifficulty(question, index, strictMode) {
  const validDifficulties = ['easy', 'medium', 'hard'];
  const isValidDifficulty =
    question.difficulty && validDifficulties.includes(question.difficulty.toLowerCase());

  if (!isValidDifficulty) {
    if (strictMode) {
      throw new Error(
        `Question ${index + 1} has an invalid 'difficulty' (must be easy, medium, or hard)`
      );
    } else {
      logger.warn(`Question ${index + 1} has invalid 'difficulty': ${question.difficulty}`);
      question.difficulty = 'medium'; // Default to medium
    }
  }

  // Ensure difficulty is lowercase
  question.difficulty = question.difficulty.toLowerCase();
}

/**
 * Ensures a question has a category field
 *
 * @param {Object} question - The question to validate and potentially fix
 * @param {number} index - The index of the question
 * @param {boolean} strictMode - Whether to use strict mode
 * @throws {Error} If validation fails in strict mode
 */
function ensureCategory(question, index, strictMode) {
  if (!question.category) {
    if (strictMode) {
      throw new Error(`Question ${index + 1} is missing the 'category' field`);
    } else {
      logger.warn(`Question ${index + 1} is missing the 'category' field`);
      question.category = 'General';
    }
  }
}

/**
 * Validates each question in the array
 *
 * @param {Array} questions - The questions array
 * @param {boolean} strictMode - Whether to use strict mode
 * @returns {Array} The validated questions
 * @throws {Error} If validation fails
 */
function validateQuestions(questions, strictMode) {
  logger.info(`Validating ${questions.length} questions`);

  questions.forEach((question, index) => {
    // Validate required fields
    validateQuestionField(question, index);
    validateOptionsArray(question, index);

    // Ensure/fix optional fields
    ensureFourOptions(question, index, strictMode);
    validateCorrectAnswer(question, index, strictMode);
    ensureExplanation(question, index, strictMode);
    validateDifficulty(question, index, strictMode);
    ensureCategory(question, index, strictMode);
  });

  logger.info(`Successfully validated ${questions.length} questions`);
  return questions;
}

module.exports = {
  validateQuestions,
  // Export these for testing
  validateQuestionField,
  validateOptionsArray,
  ensureFourOptions,
  validateCorrectAnswer,
  ensureExplanation,
  validateDifficulty,
  ensureCategory,
};
