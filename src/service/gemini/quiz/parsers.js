/**
 * @fileoverview Content parsers for quiz question generation.
 * This module handles parsing JSON content.
 */

const logger = require('../../../utils/logger');
const { findJsonByBracketMatching } = require('./extractors');

/**
 * Attempts to parse a string as JSON
 *
 * @param {string} content - The content to parse
 * @returns {Object|null} The parsed JSON or null if parsing fails
 */
function tryParseJson(content) {
  try {
    const parsed = JSON.parse(content);
    logger.info('Successfully parsed JSON content');
    return parsed;
  } catch (error) {
    logger.error('JSON parsing failed:', error.message);
    return null;
  }
}

/**
 * Attempts to parse JSON content
 *
 * @param {string} contentToProcess - The content to parse
 * @param {string} originalContent - The original content for fallback
 * @returns {Object} The parsed content
 * @throws {Error} If parsing fails
 */
function parseJsonContent(contentToProcess, originalContent) {
  let firstError;

  // First attempt: try to parse the processed content
  try {
    const parsedContent = JSON.parse(contentToProcess);
    logger.info('Successfully parsed JSON content');
    return parsedContent;
  } catch (parseError) {
    firstError = parseError;
    logger.error('JSON parsing failed:', parseError.message);
    logger.error('Cleaned content that failed to parse:', contentToProcess);
  }

  // Second attempt: try to find valid JSON by bracket matching
  logger.info('Attempting to find valid JSON by bracket matching');
  const potentialJson = findJsonByBracketMatching(originalContent);

  if (potentialJson) {
    try {
      const parsedContent = JSON.parse(potentialJson);
      logger.info('Successfully parsed JSON using bracket matching approach');
      return parsedContent;
    } catch (secondParseError) {
      logger.error('Second parsing attempt failed:', secondParseError.message);
    }
  }

  // If all attempts fail, throw the original error to maintain compatibility with tests
  throw firstError || new Error('Failed to parse JSON');
}

/**
 * Extracts a questions array from an object with a questions property
 *
 * @param {Object} content - The object to extract from
 * @returns {Array|null} The questions array or null if not found
 */
function extractQuestionsFromProperty(content) {
  if (content && typeof content === 'object' && Array.isArray(content.questions)) {
    logger.info('Found questions array property in parsed content');
    return content.questions;
  }
  return null;
}

/**
 * Extracts a single question object and wraps it in an array
 *
 * @param {Object} content - The object to extract from
 * @param {boolean} strictMode - Whether to use strict mode
 * @returns {Array|null} The wrapped question or null if not applicable
 */
function extractSingleQuestion(content, strictMode) {
  if (!strictMode && content && typeof content === 'object' && content.question) {
    logger.info('Found single question object, wrapping in array');
    return [content];
  }
  return null;
}

/**
 * Extracts questions from an items array
 *
 * @param {Object} content - The object to extract from
 * @returns {Array|null} The items array or null if not applicable
 */
function extractQuestionsFromItems(content) {
  if (
    content &&
    typeof content === 'object' &&
    Array.isArray(content.items) &&
    content.items.length > 0 &&
    typeof content.items[0] === 'object' &&
    content.items[0].question
  ) {
    logger.info('Found items array property with questions in parsed content');
    return content.items;
  }
  return null;
}

/**
 * Extracts questions from a schema definition
 *
 * @param {Object} content - The object to extract from
 * @returns {Array|null} The questions array or null if not found
 */
function extractQuestionsFromSchema(content) {
  if (
    content &&
    typeof content === 'object' &&
    content.type === 'array' &&
    typeof content.items === 'object'
  ) {
    // This is likely a schema definition
    logger.info('Found schema definition, looking for actual questions');

    // Look for an array property that might contain the actual questions
    for (const key in content) {
      if (
        key !== 'type' &&
        Array.isArray(content[key]) &&
        content[key].length > 0 &&
        typeof content[key][0] === 'object' &&
        content[key][0].question
      ) {
        logger.info(`Found questions in property "${key}"`);
        return content[key];
      }
    }

    // Special case: if we have both a schema definition and an "items" array with actual questions
    if (
      Array.isArray(content.items) &&
      content.items.length > 0 &&
      typeof content.items[0] === 'object' &&
      content.items[0].question
    ) {
      logger.info('Found questions in items array (special case)');
      return content.items;
    }
  }
  return null;
}

/**
 * Extracts questions array from parsed content
 *
 * @param {Object} parsedContent - The parsed content
 * @param {boolean} strictMode - Whether to use strict mode
 * @returns {Array} The questions array
 * @throws {Error} If questions cannot be extracted
 */
function extractQuestionsArray(parsedContent, strictMode) {
  // If it's already an array, return it
  if (Array.isArray(parsedContent)) {
    return parsedContent;
  }

  logger.error('Parsed content is not an array:', typeof parsedContent);

  // Try different extraction methods
  const questions =
    extractQuestionsFromProperty(parsedContent) ||
    extractSingleQuestion(parsedContent, strictMode) ||
    extractQuestionsFromItems(parsedContent) ||
    extractQuestionsFromSchema(parsedContent);

  if (questions) {
    return questions;
  }

  throw new Error('Generated content is not an array or valid questions object');
}

module.exports = {
  parseJsonContent,
  extractQuestionsArray,
  // Export these for testing
  tryParseJson,
  extractQuestionsFromProperty,
  extractSingleQuestion,
  extractQuestionsFromItems,
  extractQuestionsFromSchema,
};
