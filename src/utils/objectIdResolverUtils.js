/**
 * Object ID Resolver Utilities
 * @module utils/objectIdResolverUtils
 * @description Utility functions to resolve object IDs from names and vice versa
 */

const { getTopicById, getTopicByTitle } = require('../repository/topicRepository');
const { getLanguageById, getLanguageByName } = require('../repository/languageRepository');
const { getPositionById, getPositionByTitle } = require('../repository/positionRepository');
const logger = require('./logger');

/**
 * Resolves topic ID from title or title from ID
 * @async
 * @param {Object} req - Express request object
 * @param {string|null} topicId - Topic ID if available
 * @param {string|null} topicTitle - Topic title if available
 * @returns {Promise<Object>} Object containing resolved topic ID and title
 */
async function resolveTopicData(req, topicId, topicTitle) {
  try {
    // If topic_id is provided, get the topic title
    if (topicId) {
      const topic = await getTopicById(topicId);
      if (topic) {
        return {
          topic_id: topicId,
          topic: topic.title,
        };
      }
      logger.warn(`Topic with ID ${topicId} not found`);
    }

    // If topic title is provided, get the topic ID
    if (topicTitle) {
      const topic = await getTopicByTitle(topicTitle);
      if (topic) {
        return {
          topic_id: topic._id.toString(),
          topic: topicTitle,
        };
      }
      logger.warn(`Topic with title ${topicTitle} not found`);
    }

    // Return original values if no resolution was possible
    return {
      topic_id: topicId,
      topic: topicTitle,
    };
  } catch (error) {
    logger.error('Error resolving topic data:', error);
    return {
      topic_id: topicId,
      topic: topicTitle,
    };
  }
}

/**
 * Resolves language ID from name or name from ID
 * @async
 * @param {Object} req - Express request object
 * @param {string|null} languageId - Language ID if available
 * @param {string|null} languageName - Language name if available
 * @returns {Promise<Object>} Object containing resolved language ID and name
 */
async function resolveLanguageData(req, languageId, languageName) {
  try {
    // If language_id is provided, get the language name
    if (languageId) {
      const language = await getLanguageById(languageId);
      if (language) {
        return {
          language_id: languageId,
          language: language.name,
        };
      }
      logger.warn(`Language with ID ${languageId} not found`);
    }

    // If language name is provided, get the language ID
    if (languageName) {
      const language = await getLanguageByName(languageName);
      if (language) {
        return {
          language_id: language._id.toString(),
          language: languageName,
        };
      }
      logger.warn(`Language with name ${languageName} not found`);
    }

    // Return original values if no resolution was possible
    return {
      language_id: languageId,
      language: languageName,
    };
  } catch (error) {
    logger.error('Error resolving language data:', error);
    return {
      language_id: languageId,
      language: languageName,
    };
  }
}

/**
 * Resolves position ID from title or title from ID
 * @async
 * @param {Object} req - Express request object
 * @param {string|null} positionId - Position ID if available
 * @param {string|null} positionTitle - Position title if available
 * @returns {Promise<Object>} Object containing resolved position ID and title
 */
async function resolvePositionData(req, positionId, positionTitle) {
  try {
    // If position_id is provided, get the position title
    if (positionId) {
      const position = await getPositionById(positionId);
      if (position) {
        return {
          position_id: positionId,
          position: position.title,
        };
      }
      logger.warn(`Position with ID ${positionId} not found`);
    }

    // If position title is provided, get the position ID
    if (positionTitle) {
      const position = await getPositionByTitle(positionTitle);
      if (position) {
        return {
          position_id: position._id.toString(),
          position: positionTitle,
        };
      }
      logger.warn(`Position with title ${positionTitle} not found`);
    }

    // Return original values if no resolution was possible
    return {
      position_id: positionId,
      position: positionTitle,
    };
  } catch (error) {
    logger.error('Error resolving position data:', error);
    return {
      position_id: positionId,
      position: positionTitle,
    };
  }
}

module.exports = {
  resolveTopicData,
  resolveLanguageData,
  resolvePositionData,
};
