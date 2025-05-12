/**
 * Logic Question Service Module
 * @module service/logicQuestionService
 */

const {
  createLogicQuestion,
  updateLogicQuestion,
  deleteLogicQuestion,
} = require('../repository/logicQuestionRepository');
const { checkLogicTagsExist } = require('../repository/logicTagRepository');
const { isValidObjectId, toObjectIds, areValidObjectIds } = require('../utils/validateObjectId');
const logger = require('../utils/logger');

// Import the new service modules
const { getQuestions, getQuestionById } = require('./logicQuestionGetService');

/**
 * Validate logic question data
 * @param {Object} questionData - Question data to validate
 * @param {boolean} isUpdate - Whether this is an update operation
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateLogicQuestionData(questionData, isUpdate = false) {
  const errors = [];

  // For updates, we don't require all fields to be present
  if (!isUpdate) {
    // Required fields
    if (!questionData.question) {
      errors.push('Question text is required');
    }

    if (questionData.level === undefined) {
      errors.push('Difficulty level is required');
    }

    if (
      !questionData.tag_ids ||
      !Array.isArray(questionData.tag_ids) ||
      questionData.tag_ids.length === 0
    ) {
      errors.push('At least one tag ID is required');
    }

    if (!questionData.type) {
      errors.push('Question type is required');
    }

    if (!questionData.answer_explanation) {
      errors.push('Answer explanation is required');
    }
  }

  // Validate fields if they are present
  if (questionData.question !== undefined && typeof questionData.question !== 'string') {
    errors.push('Question text must be a string');
  }

  if (questionData.level !== undefined) {
    if (typeof questionData.level !== 'number') {
      errors.push('Difficulty level must be a number');
    } else if (
      questionData.level < 1 ||
      questionData.level > 6 ||
      !Number.isInteger(questionData.level)
    ) {
      errors.push('Difficulty level must be an integer between 1 and 6');
    }
  }

  if (questionData.tag_ids !== undefined) {
    if (!Array.isArray(questionData.tag_ids)) {
      errors.push('Tag IDs must be an array');
    } else if (questionData.tag_ids.length === 0) {
      errors.push('At least one tag ID is required');
    } else if (!areValidObjectIds(questionData.tag_ids)) {
      errors.push('One or more tag IDs are invalid');
    }
  }

  if (questionData.type !== undefined) {
    if (typeof questionData.type !== 'string') {
      errors.push('Question type must be a string');
    } else if (!['multiple_choice', 'open_question'].includes(questionData.type)) {
      errors.push('Question type must be either "multiple_choice" or "open_question"');
    }
  }

  // Validate choices for multiple_choice type
  if (questionData.type === 'multiple_choice') {
    if (
      !questionData.choices ||
      !Array.isArray(questionData.choices) ||
      questionData.choices.length === 0
    ) {
      errors.push('Multiple choice questions must have at least one choice');
    } else {
      // Check if at least one choice is marked as correct
      const hasCorrectChoice = questionData.choices.some(choice => choice.is_correct === true);
      if (!hasCorrectChoice) {
        errors.push('Multiple choice questions must have at least one correct answer');
      }

      // Validate each choice
      questionData.choices.forEach((choice, index) => {
        if (!choice.text) {
          errors.push(`Choice ${index + 1} is missing text`);
        }
        if (choice.is_correct === undefined) {
          errors.push(`Choice ${index + 1} is missing is_correct flag`);
        }
      });
    }
  }

  if (
    questionData.answer_explanation !== undefined &&
    typeof questionData.answer_explanation !== 'string'
  ) {
    errors.push('Answer explanation must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new logic question
 * @async
 * @param {Object} questionData - Data for the new question
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function createQuestion(questionData) {
  try {
    // Validate question data
    const validation = validateLogicQuestionData(questionData);
    if (!validation.isValid) {
      logger.warn('Invalid logic question data:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Convert tag_ids to ObjectIds
    questionData.tag_ids = toObjectIds(questionData.tag_ids);

    // Check if all tags exist
    const tagsExist = await checkLogicTagsExist(questionData.tag_ids);
    if (!tagsExist) {
      logger.warn('One or more tags do not exist');
      return {
        success: false,
        errors: ['One or more tags do not exist'],
      };
    }

    // Create question
    const question = await createLogicQuestion(questionData);
    logger.info('Logic question created successfully');

    return {
      success: true,
      data: question,
    };
  } catch (error) {
    logger.error('Error creating logic question:', error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Update logic question
 * @async
 * @param {string} id - Question ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function updateQuestion(id, updateData) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic question ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid question ID format'],
      };
    }

    // Validate update data
    const validation = validateLogicQuestionData(updateData, true);
    if (!validation.isValid) {
      logger.warn('Invalid logic question update data:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Convert tag_ids to ObjectIds if provided
    if (updateData.tag_ids) {
      updateData.tag_ids = toObjectIds(updateData.tag_ids);

      // Check if all tags exist
      const tagsExist = await checkLogicTagsExist(updateData.tag_ids);
      if (!tagsExist) {
        logger.warn('One or more tags do not exist');
        return {
          success: false,
          errors: ['One or more tags do not exist'],
        };
      }
    }

    const updatedQuestion = await updateLogicQuestion(id, updateData);

    if (!updatedQuestion) {
      logger.warn(`Logic question with ID ${id} not found for update`);
      return {
        success: false,
        errors: ['Question not found'],
      };
    }

    logger.info(`Updated logic question with ID ${id}`);
    return {
      success: true,
      data: updatedQuestion,
    };
  } catch (error) {
    logger.error(`Error updating logic question with ID ${id}:`, error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Delete logic question
 * @async
 * @param {string} id - Question ID
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function deleteQuestion(id) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic question ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid question ID format'],
      };
    }

    const deletedQuestion = await deleteLogicQuestion(id);

    if (!deletedQuestion) {
      logger.warn(`Logic question with ID ${id} not found for deletion`);
      return {
        success: false,
        errors: ['Question not found'],
      };
    }

    logger.info(`Deleted logic question with ID ${id}`);
    return {
      success: true,
      data: deletedQuestion,
    };
  } catch (error) {
    logger.error(`Error deleting logic question with ID ${id}:`, error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

module.exports = {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
};
