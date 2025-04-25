/**
 * Submission Validator Module
 * @module utils/submissionValidator
 */

const { ObjectId } = require('mongodb');
const submissionModel = require('../models/submissionModel');
const logger = require('./logger');

/**
 * Validates if a value is a valid ObjectId
 * @param {string} id - ID to validate
 * @returns {boolean} True if ID is a valid ObjectId, false otherwise
 */
function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

/**
 * Validates if an answer value is within the allowed range
 * @param {number|null} answer - Answer value to validate
 * @returns {boolean} True if answer is valid, false otherwise
 */
function isValidAnswerValue(answer) {
  if (answer === null) return true;

  const { min, max } = submissionModel.answerValueRange;
  return Number.isInteger(answer) && answer >= min && answer <= max;
}

/**
 * Validates if is_skip is a valid boolean value (0 or 1)
 * @param {number} isSkip - Value to validate
 * @returns {boolean} True if is_skip is valid, false otherwise
 */
function isValidIsSkip(isSkip) {
  return isSkip === 0 || isSkip === 1;
}

/**
 * Validates submission input data
 * @param {Object} submissionData - Submission data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateSubmissionInput(submissionData) {
  const errors = [];
  const { requiredFields, requiredAnswerFields } = submissionModel;

  // Check required fields
  for (const field of requiredFields) {
    if (!submissionData[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate candidate_id is a valid ObjectId
  if (submissionData.candidate_id && !isValidObjectId(submissionData.candidate_id)) {
    errors.push('Invalid candidate_id format');
  }

  // Validate answers array if present
  if (submissionData.answers) {
    if (!Array.isArray(submissionData.answers)) {
      errors.push('Field answers must be an array');
    } else {
      // Validate each answer in the array
      submissionData.answers.forEach((answer, index) => {
        // Check required fields for each answer
        for (const field of requiredAnswerFields) {
          if (!answer[field]) {
            errors.push(`Missing required field: ${field} in answers[${index}]`);
          }
        }

        // Validate question_id is a valid ObjectId
        if (answer.question_id && !isValidObjectId(answer.question_id)) {
          errors.push(`Invalid question_id format in answers[${index}]`);
        }

        // Validate answer value if present
        if (answer.answer !== undefined && !isValidAnswerValue(answer.answer)) {
          errors.push(
            `Invalid answer value in answers[${index}]. Must be an integer between 0 and 3 or null`
          );
        }

        // Validate is_skip if present
        if (answer.is_skip !== undefined && !isValidIsSkip(answer.is_skip)) {
          errors.push(`Invalid is_skip value in answers[${index}]. Must be 0 or 1`);
        }
      });
    }
  }

  // Validate essay if present
  if (submissionData.essay) {
    if (typeof submissionData.essay !== 'object') {
      errors.push('Field essay must be an object');
    } else {
      // Validate is_skip if present
      if (
        submissionData.essay.is_skip !== undefined &&
        !isValidIsSkip(submissionData.essay.is_skip)
      ) {
        errors.push('Invalid is_skip value in essay. Must be 0 or 1');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats submission data with default values for missing fields
 * @param {Object} submissionData - Raw submission data
 * @returns {Object} Formatted submission data with defaults applied
 */
function formatSubmissionDefaults(submissionData) {
  const { defaultValues } = submissionModel;
  const formattedSubmission = { ...submissionData };

  // Apply default values for missing fields
  if (formattedSubmission.answers === undefined) {
    formattedSubmission.answers = defaultValues.answers;
  }

  // Apply default values for essay if missing
  if (formattedSubmission.essay === undefined) {
    formattedSubmission.essay = defaultValues.essay;
  } else if (formattedSubmission.essay) {
    // Apply defaults for missing essay fields
    formattedSubmission.essay = {
      ...defaultValues.essay,
      ...formattedSubmission.essay,
    };
  }

  // Apply default values for review if missing
  if (formattedSubmission.review === undefined) {
    formattedSubmission.review = defaultValues.review;
  } else if (formattedSubmission.review) {
    // Apply defaults for missing review fields
    formattedSubmission.review = {
      ...defaultValues.review,
      ...formattedSubmission.review,
    };
  }

  // Apply default is_skip value to each answer if missing
  if (Array.isArray(formattedSubmission.answers)) {
    formattedSubmission.answers = formattedSubmission.answers.map(answer => ({
      ...answer,
      is_skip: answer.is_skip !== undefined ? answer.is_skip : 0,
      other: answer.other !== undefined ? answer.other : '',
    }));
  }

  return formattedSubmission;
}

/**
 * Sanitizes submission data for update operations
 * @param {Object} updateData - Data to be used for update
 * @returns {Object} Sanitized update data
 */
function sanitizeUpdateData(updateData) {
  const sanitized = { ...updateData };
  return sanitized;
}

module.exports = {
  validateSubmissionInput,
  formatSubmissionDefaults,
  sanitizeUpdateData,
  isValidObjectId,
  isValidAnswerValue,
  isValidIsSkip,
};
