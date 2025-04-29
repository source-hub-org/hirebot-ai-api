/**
 * Position Utilities
 * @module utils/positionUtils
 */

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
 * Gets position pagination based on the position string
 * @param {string} position - The position string
 * @returns {Object} - Position pagination including difficultyText, positionInstruction, and positionLevel
 */
const getPositionMetadata = position => {
  const positionLowerCase = position.toLowerCase();
  let difficultyText, positionInstruction, positionLevel;

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
