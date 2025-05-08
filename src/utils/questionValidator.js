/**
 * Question Validator Module
 * @module utils/questionValidator
 */

/**
 * Validates question data for creation or update
 * @param {Object} data - Question data to validate
 * @returns {Object} Validation result with errors array and isValid flag
 */
function validateQuestionData(data) {
  const errors = [];

  // Check if data is provided
  if (!data) {
    errors.push('Question data is required');
    return { isValid: false, errors };
  }

  // Validate question text
  if (!data.question || typeof data.question !== 'string' || data.question.trim() === '') {
    errors.push('Question text is required and must be a non-empty string');
  }

  // Validate options
  if (!data.options || !Array.isArray(data.options)) {
    errors.push('Options must be an array');
  } else if (data.options.length !== 4) {
    errors.push('Options must contain exactly 4 items');
  } else if (!data.options.every(option => typeof option === 'string' && option.trim() !== '')) {
    errors.push('All options must be non-empty strings');
  }

  // Validate correctAnswer
  if (data.correctAnswer === undefined || data.correctAnswer === null) {
    errors.push('Correct answer index is required');
  } else if (
    !Number.isInteger(data.correctAnswer) ||
    data.correctAnswer < 0 ||
    data.correctAnswer > 3
  ) {
    errors.push('Correct answer must be an integer between 0 and 3');
  }

  // Validate explanation
  if (!data.explanation || typeof data.explanation !== 'string' || data.explanation.trim() === '') {
    errors.push('Explanation is required and must be a non-empty string');
  }

  // Validate difficulty
  const validDifficulties = ['easy', 'medium', 'hard'];
  if (!data.difficulty || typeof data.difficulty !== 'string') {
    errors.push('Difficulty is required and must be a string');
  } else if (!validDifficulties.includes(data.difficulty.toLowerCase())) {
    errors.push(`Difficulty must be one of: ${validDifficulties.join(', ')}`);
  }

  // Validate category
  if (!data.category || typeof data.category !== 'string' || data.category.trim() === '') {
    errors.push('Category is required and must be a non-empty string');
  }

  // Validate topic
  if (!data.topic || typeof data.topic !== 'string' || data.topic.trim() === '') {
    errors.push('Topic is required and must be a non-empty string');
  }

  // Validate language
  if (!data.language || typeof data.language !== 'string' || data.language.trim() === '') {
    errors.push('Language is required and must be a non-empty string');
  }

  // Validate position
  if (!data.position || typeof data.position !== 'string' || data.position.trim() === '') {
    errors.push('Position is required and must be a non-empty string');
  }

  // Validate positionLevel
  if (data.positionLevel === undefined || data.positionLevel === null) {
    errors.push('Position level is required');
  } else if (!Number.isInteger(data.positionLevel) || data.positionLevel < 1) {
    errors.push('Position level must be an integer greater than or equal to 1');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Formats validation error response
 * @param {Array<string>} errors - Array of error messages
 * @returns {Object} Formatted error response
 */
function formatValidationErrorResponse(errors) {
  return {
    status: 'error',
    message: 'Validation failed',
    errors,
  };
}

module.exports = {
  validateQuestionData,
  formatValidationErrorResponse,
};
