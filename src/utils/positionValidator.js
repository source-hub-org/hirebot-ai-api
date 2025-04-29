/**
 * Position Validator Module
 * @module utils/positionValidator
 */

const logger = require('./logger');
const { isValidPosition } = require('./positionUtils');

/**
 * Validate the structure of a positions JSON file
 * @param {Object|Array} data - The parsed JSON data
 * @returns {Object} Validation result with isValid flag and any errors
 */
function validatePositionsData(data) {
  const errors = [];

  // Check if data is an array (direct array of positions)
  if (Array.isArray(data)) {
    // Validate each position in the array
    data.forEach((position, index) => {
      const positionErrors = validatePositionObject(position, index);
      errors.push(...positionErrors);
    });
  }
  // Check if data is an object with positions array
  else if (data && typeof data === 'object' && Array.isArray(data.positions)) {
    // Validate each position in the array
    data.positions.forEach((position, index) => {
      const positionErrors = validatePositionObject(position, index);
      errors.push(...positionErrors);
    });
  }
  // Invalid data format
  else {
    errors.push(
      'Invalid data format: expected an array of positions or an object with a positions array'
    );
    return { isValid: false, errors };
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single position object
 * @param {Object} position - The position object to validate
 * @param {number} index - The index of the position in the array
 * @returns {Array<string>} Array of validation error messages
 */
function validatePositionObject(position, index) {
  const errors = [];
  const requiredFields = ['slug', 'title', 'description', 'instruction', 'level'];

  // Check if position is an object
  if (!position || typeof position !== 'object') {
    return [`Position at index ${index} is not a valid object`];
  }

  // Check required fields
  requiredFields.forEach(field => {
    if (position[field] === undefined) {
      errors.push(`Position at index ${index} is missing required field: "${field}"`);
    }
  });

  // Validate field types
  if (position.slug !== undefined && typeof position.slug !== 'string') {
    errors.push(`Position at index ${index}: "slug" must be a string`);
  }

  if (position.title !== undefined && typeof position.title !== 'string') {
    errors.push(`Position at index ${index}: "title" must be a string`);
  }

  if (position.description !== undefined && typeof position.description !== 'string') {
    errors.push(`Position at index ${index}: "description" must be a string`);
  }

  if (position.instruction !== undefined && typeof position.instruction !== 'string') {
    errors.push(`Position at index ${index}: "instruction" must be a string`);
  }

  if (position.level !== undefined && typeof position.level !== 'number') {
    errors.push(`Position at index ${index}: "level" must be a number`);
  }

  if (position.is_active !== undefined && typeof position.is_active !== 'boolean') {
    errors.push(`Position at index ${index}: "is_active" must be a boolean`);
  }

  return errors;
}

module.exports = {
  validatePositionsData,
  validatePositionObject,
};
