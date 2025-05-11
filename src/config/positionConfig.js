/**
 * Position Configuration Module
 * @module config/positionConfig
 */

require('dotenv').config();
const logger = require('../utils/logger');

/**
 * Default position difficulty text values if environment variables are not set
 * @constant {Object}
 */
const DEFAULT_DIFFICULTY_TEXT = {
  intern: 'basic understanding of programming concepts',
  fresher: 'fundamental programming knowledge',
  junior: 'practical application of programming concepts',
  middle: 'intermediate understanding of software development',
  senior: 'deep understanding of scalable systems and best practices',
  expert: 'advanced architectural thinking and system design expertise',
};

/**
 * Default position instruction text values if environment variables are not set
 * @constant {Object}
 */
const DEFAULT_POSITION_INSTRUCTION = {
  intern: 'suitable for an intern-level candidate',
  fresher: 'appropriate for a fresher with limited experience',
  junior: 'targeted at a junior developer with some experience',
  middle: 'designed for a mid-level developer with solid experience',
  senior: 'targeted at a senior developer with extensive experience',
  expert: 'challenging for expert-level developers and architects',
};

/**
 * Default position levels if environment variables are not set
 * @constant {Object}
 */
const DEFAULT_POSITION_LEVELS = {
  intern: 1,
  fresher: 2,
  junior: 3,
  middle: 4,
  senior: 5,
  expert: 6,
};

/**
 * Get difficulty text from environment variables or fallback to defaults
 * @param {string} position - Position slug
 * @returns {string} - Difficulty text for the position
 */
const getDifficultyText = position => {
  const envVarName = `POSITION_DIFFICULTY_TEXT_${position.toUpperCase()}`;
  const envValue = process.env[envVarName];

  if (envValue) {
    return envValue;
  }

  if (DEFAULT_DIFFICULTY_TEXT[position]) {
    logger.debug(`Environment variable ${envVarName} not found, using default value`);
    return DEFAULT_DIFFICULTY_TEXT[position];
  }

  logger.warn(`No difficulty text found for position: ${position}, using generic value`);
  return 'various difficulty levels';
};

/**
 * Get position instruction from environment variables or fallback to defaults
 * @param {string} position - Position slug
 * @returns {string} - Position instruction for the position
 */
const getPositionInstruction = position => {
  const envVarName = `POSITION_INSTRUCTION_${position.toUpperCase()}`;
  const envValue = process.env[envVarName];

  if (envValue) {
    return envValue;
  }

  if (DEFAULT_POSITION_INSTRUCTION[position]) {
    logger.debug(`Environment variable ${envVarName} not found, using default value`);
    return DEFAULT_POSITION_INSTRUCTION[position];
  }

  logger.warn(`No position instruction found for position: ${position}, using generic value`);
  return 'suitable for developers of different experience levels';
};

/**
 * Get position level from environment variables or fallback to defaults
 * @param {string} position - Position slug
 * @returns {number} - Position level for the position
 */
const getPositionLevel = position => {
  const envVarName = `POSITION_LEVEL_${position.toUpperCase()}`;
  const envValue = process.env[envVarName];

  if (envValue) {
    const level = parseFloat(envValue);
    if (!isNaN(level)) {
      return level;
    }
    logger.warn(
      `Invalid position level in environment variable ${envVarName}: ${envValue}, using default`
    );
  }

  if (DEFAULT_POSITION_LEVELS[position]) {
    logger.debug(`Environment variable ${envVarName} not found or invalid, using default value`);
    return DEFAULT_POSITION_LEVELS[position];
  }

  logger.warn(`No position level found for position: ${position}, using default level 3`);
  return 3; // Default to junior level
};

module.exports = {
  getDifficultyText,
  getPositionInstruction,
  getPositionLevel,
  DEFAULT_DIFFICULTY_TEXT,
  DEFAULT_POSITION_INSTRUCTION,
  DEFAULT_POSITION_LEVELS,
};
