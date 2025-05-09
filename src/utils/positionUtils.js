/**
 * Position Utilities
 * @module utils/positionUtils
 */

const { getPositionBySlug } = require('../repository/positionRepository');
const logger = require('./logger');

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
const getPositionMetadata = async (position) => {
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
      // Fallback to default values if position not found in database
      logger.warn(`Position with slug '${positionLowerCase}' not found in database, using default values`);
      
      // Default values based on position level
      switch (positionLowerCase) {
        case 'intern':
          difficultyText = 'basic understanding of programming concepts';
          positionInstruction = 'suitable for an intern-level candidate';
          positionLevel = 1;
          break;
        case 'fresher':
          difficultyText = 'fundamental programming knowledge';
          positionInstruction = 'appropriate for a fresher with limited experience';
          positionLevel = 2;
          break;
        case 'junior':
          difficultyText = 'practical application of programming concepts';
          positionInstruction = 'targeted at a junior developer with some experience';
          positionLevel = 3;
          break;
        case 'middle':
          difficultyText = 'intermediate understanding of software development';
          positionInstruction = 'designed for a mid-level developer with solid experience';
          positionLevel = 4;
          break;
        case 'senior':
          difficultyText = 'deep understanding of scalable systems and best practices';
          positionInstruction = 'targeted at a senior developer with extensive experience';
          positionLevel = 5;
          break;
        case 'expert':
          difficultyText = 'advanced architectural thinking and system design expertise';
          positionInstruction = 'challenging for expert-level developers and architects';
          positionLevel = 6;
          break;
        default:
          difficultyText = 'various difficulty levels';
          positionInstruction = 'suitable for developers of different experience levels';
          positionLevel = 3; // Default to junior level
      }
    }
  } catch (error) {
    // Log error and use default values
    logger.error(`Error fetching position data for '${positionLowerCase}':`, error);
    
    // Default to junior level if there's an error
    difficultyText = 'various difficulty levels';
    positionInstruction = 'suitable for developers of different experience levels';
    positionLevel = 3;
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
