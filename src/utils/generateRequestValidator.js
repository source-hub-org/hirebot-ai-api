/**
 * Generate Request Validator
 * @module utils/generateRequestValidator
 */

const { VALID_POSITIONS } = require('./positionUtils');

/**
 * Validates the request body for generating questions
 * @param {Object} requestBody - The request body to validate
 * @returns {Object} - Validation result with errors array
 */
const validateGenerateRequest = requestBody => {
  const { topic, language, position } = requestBody;
  const validationErrors = [];

  if (!topic || typeof topic !== 'string') {
    validationErrors.push('Topic is required and must be a string');
  }

  if (!language || typeof language !== 'string') {
    validationErrors.push('Language is required and must be a string');
  }

  if (!position || typeof position !== 'string') {
    validationErrors.push('Position is required and must be a string');
  }

  // Validate position is one of the allowed values
  if (position && !VALID_POSITIONS.includes(position.toLowerCase())) {
    validationErrors.push(`Position must be one of: ${VALID_POSITIONS.join(', ')}`);
  }

  return {
    isValid: validationErrors.length === 0,
    errors: validationErrors,
  };
};

module.exports = {
  validateGenerateRequest,
};
