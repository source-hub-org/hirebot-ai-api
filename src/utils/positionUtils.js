/**
 * Position Utilities
 * @module utils/positionUtils
 */

const { getPositionBySlug } = require('../repository/positionRepository');
const logger = require('./logger');
const {
  getDifficultyText,
  getPositionInstruction,
  getPositionLevel,
} = require('../config/positionConfig');

/**
 * Valid position values
 * @constant {string[]}
 */
const VALID_POSITIONS = ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'];

/**
 * Validates if a position is valid
 * @param {string} position - The position to validate
 * @returns {boolean} - Whether the position is valid
 */
const isValidPosition = position => {
  return position && VALID_POSITIONS.includes(position.toLowerCase());
};

/**
 * Gets position metadata based on the position string
 * @async
 * @param {string} position - The position string
 * @returns {Promise<Object>} - Position metadata including difficultyText, positionInstruction, and positionLevel
 */
const getPositionMetadata = async position => {
  const positionLowerCase = position.toLowerCase();
  let difficultyText, positionInstruction, positionLevel;

  try {
    // Try to get position data from the database
    const positionData = await getPositionBySlug(positionLowerCase);

    if (positionData) {
      // Use data from the database
      difficultyText = positionData.description || '';
      positionInstruction = positionData.instruction || '';
      positionLevel = positionData.level || 3; // Default to junior level if not specified
    } else {
      // Fallback to config values if position not found in database
      logger.warn(
        `Position with slug '${positionLowerCase}' not found in database, using configured values`
      );

      // Get values from configuration (which reads from environment variables)
      difficultyText = getDifficultyText(positionLowerCase);
      positionInstruction = getPositionInstruction(positionLowerCase);
      positionLevel = getPositionLevel(positionLowerCase);
    }
  } catch (error) {
    // Log error and use config values
    logger.error(`Error fetching position data for '${positionLowerCase}':`, error);

    // Get values from configuration as fallback
    difficultyText = getDifficultyText(positionLowerCase);
    positionInstruction = getPositionInstruction(positionLowerCase);
    positionLevel = getPositionLevel(positionLowerCase);
  }

  return {
    difficultyText,
    positionInstruction,
    positionLevel,
  };
};

/**
 * Formats a position string for display (capitalizes first letter)
 * @param {string} position - The position string to format
 * @returns {string} - The formatted position string
 */
const formatPositionForDisplay = position => {
  return position.charAt(0).toUpperCase() + position.slice(1);
};

module.exports = {
  VALID_POSITIONS,
  isValidPosition,
  getPositionMetadata,
  formatPositionForDisplay,
};
