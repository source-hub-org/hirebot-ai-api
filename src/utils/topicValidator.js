/**
 * Topic Validator Module
 * @module utils/topicValidator
 */

const logger = require('./logger');

/**
 * Validate the structure of a topics JSON file
 * @param {Object} data - The parsed JSON data
 * @returns {Object} Validation result with isValid flag and any errors
 */
function validateTopicsData(data) {
  const errors = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid data format: expected an object');
    return { isValid: false, errors };
  }

  // Check if topics array exists
  if (!Array.isArray(data.topics)) {
    errors.push('Invalid data format: missing or invalid "topics" array');
    return { isValid: false, errors };
  }

  // Validate each topic in the array
  data.topics.forEach((topic, index) => {
    const topicErrors = validateTopicObject(topic, index);
    errors.push(...topicErrors);
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate a single topic object
 * @param {Object} topic - The topic object to validate
 * @param {number} index - The index of the topic in the array
 * @returns {Array<string>} Array of validation error messages
 */
function validateTopicObject(topic, index) {
  const errors = [];
  const requiredFields = ['title', 'difficulty', 'popularity', 'suitable_level', 'description'];

  // Check if topic is an object
  if (!topic || typeof topic !== 'object') {
    return [`Topic at index ${index} is not a valid object`];
  }

  // Check required fields
  requiredFields.forEach(field => {
    if (topic[field] === undefined) {
      errors.push(`Topic at index ${index} is missing required field: "${field}"`);
    }
  });

  // Validate field types
  if (topic.title !== undefined && typeof topic.title !== 'string') {
    errors.push(`Topic at index ${index}: "title" must be a string`);
  }

  if (topic.difficulty !== undefined && typeof topic.difficulty !== 'number') {
    errors.push(`Topic at index ${index}: "difficulty" must be a number`);
  }

  if (topic.popularity !== undefined && typeof topic.popularity !== 'string') {
    errors.push(`Topic at index ${index}: "popularity" must be a string`);
  }

  if (topic.suitable_level !== undefined && typeof topic.suitable_level !== 'string') {
    errors.push(`Topic at index ${index}: "suitable_level" must be a string`);
  }

  if (topic.description !== undefined && typeof topic.description !== 'string') {
    errors.push(`Topic at index ${index}: "description" must be a string`);
  }

  return errors;
}

module.exports = {
  validateTopicsData,
  validateTopicObject,
};
