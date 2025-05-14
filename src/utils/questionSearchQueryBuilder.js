/**
 * Question Search Query Builder Module
 * @module utils/questionSearchQueryBuilder
 */

const { ObjectId } = require('mongodb');

/**
 * Escapes special characters in a string for use in a regular expression
 * @param {string} string - The string to escape
 * @returns {string} The escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Converts string IDs to MongoDB ObjectIds
 * @param {string|null|undefined} idString - Comma-separated string of IDs
 * @returns {Array<ObjectId>} Array of MongoDB ObjectIds
 */
function convertToObjectIds(idString) {
  if (!idString) return [];

  // Handle the case when idString is not a string
  if (typeof idString !== 'string') return [];

  return idString
    .split(',')
    .map(id => id.trim())
    .filter(id => id && ObjectId.isValid(id))
    .map(id => new ObjectId(id));
}

/**
 * Builds MongoDB query parameters based on search criteria
 * This function supports both old and new parameter signatures for backward compatibility
 *
 * Old signature: (topic, language, position, sort_by, sort_direction, page, pageSize)
 * New signature: (topic, topic_id, language, language_id, position, position_id, sort_by, sort_direction, page, pageSize)
 *
 * @param {string|undefined} topic - Topic(s) to search for (comma-separated)
 * @param {string|undefined} param2 - Topic ID(s) or language depending on signature
 * @param {string|undefined} param3 - Language(s) or position depending on signature
 * @param {string|undefined} param4 - Language ID(s) or sort_by depending on signature
 * @param {string|undefined} param5 - Position or sort_direction depending on signature
 * @param {string|number|undefined} param6 - Position ID(s) or page depending on signature
 * @param {string|number|undefined} param7 - Sort by or pageSize depending on signature
 * @param {string|undefined} param8 - Sort direction (only in new signature)
 * @param {number|undefined} param9 - Page number (only in new signature)
 * @param {number|undefined} param10 - Page size (only in new signature)
 * @returns {Object} MongoDB query parameters
 */
function buildMongoQuery(
  topic,
  param2,
  param3,
  param4,
  param5,
  param6,
  param7,
  param8,
  param9,
  param10
) {
  let topic_id,
    language,
    language_id,
    position,
    position_id,
    sort_by,
    sort_direction,
    page,
    pageSize;

  // Detect if we're using the old signature or the new signature
  // In the old signature, the 7th parameter is the last one (pageSize)
  const isOldSignature = param8 === undefined;

  if (isOldSignature) {
    // Old signature: (topic, language, position, sort_by, sort_direction, page, pageSize)
    language = param2;
    position = param3;
    sort_by = param4;
    sort_direction = param5;
    page = param6;
    pageSize = param7;

    // Set ID fields to undefined
    topic_id = undefined;
    language_id = undefined;
    position_id = undefined;
  } else {
    // New signature: (topic, topic_id, language, language_id, position, position_id, sort_by, sort_direction, page, pageSize)
    topic_id = param2;
    language = param3;
    language_id = param4;
    position = param5;
    position_id = param6;
    sort_by = param7;
    sort_direction = param8;
    page = param9;
    pageSize = param10;
  }

  // 1. Build filter
  const filter = {};
  const andConditions = [];

  // Handle topic and topic_id as an OR condition
  const topicConditions = [];

  // Handle topic parameter (optional, can be multiple comma-separated values)
  if (topic) {
    const topics = topic.split(',').map(t => t.trim());
    if (topics.length === 1) {
      topicConditions.push({ topic: { $regex: new RegExp(escapeRegExp(topics[0]), 'i') } });
    } else if (topics.length > 1) {
      topicConditions.push({
        topic: { $in: topics.map(t => new RegExp(escapeRegExp(t), 'i')) },
      });
    }
  }

  // Handle topic_id parameter (optional, can be multiple comma-separated values)
  if (topic_id) {
    const topicIds = convertToObjectIds(topic_id);
    if (topicIds.length === 1) {
      topicConditions.push({ topic_id: topicIds[0] });
    } else if (topicIds.length > 1) {
      topicConditions.push({ topic_id: { $in: topicIds } });
    }
  }

  // Add topic conditions to AND array if any exist
  if (topicConditions.length > 0) {
    andConditions.push({ $or: topicConditions });
  }

  // Handle language and language_id as an OR condition
  const languageConditions = [];

  // Handle language parameter (optional, can be multiple comma-separated values)
  if (language) {
    const languages = language.split(',').map(l => l.trim());
    if (languages.length === 1) {
      languageConditions.push({
        language: { $regex: new RegExp(escapeRegExp(languages[0]), 'i') },
      });
    } else if (languages.length > 1) {
      languageConditions.push({
        language: { $in: languages.map(l => new RegExp(escapeRegExp(l), 'i')) },
      });
    }
  }

  // Handle language_id parameter (optional, can be multiple comma-separated values)
  if (language_id) {
    const languageIds = convertToObjectIds(language_id);
    if (languageIds.length === 1) {
      languageConditions.push({ language_id: languageIds[0] });
    } else if (languageIds.length > 1) {
      languageConditions.push({ language_id: { $in: languageIds } });
    }
  }

  // Add language conditions to AND array if any exist
  if (languageConditions.length > 0) {
    andConditions.push({ $or: languageConditions });
  }

  // Handle position and position_id as an OR condition
  const positionConditions = [];

  // Handle position parameter (optional, can be multiple comma-separated values)
  if (position) {
    const positions = position.split(',').map(p => p.trim());
    if (positions.length === 1) {
      // For position, we need to handle capitalization in the database
      const positionRegex = new RegExp(`^${escapeRegExp(positions[0])}$`, 'i');
      positionConditions.push({ position: { $regex: positionRegex } });
    } else if (positions.length > 1) {
      positionConditions.push({
        position: { $in: positions.map(p => new RegExp(`^${escapeRegExp(p)}$`, 'i')) },
      });
    }
  }

  // Handle position_id parameter (optional, can be multiple comma-separated values)
  if (position_id) {
    const positionIds = convertToObjectIds(position_id);
    if (positionIds.length === 1) {
      positionConditions.push({ position_id: positionIds[0] });
    } else if (positionIds.length > 1) {
      positionConditions.push({ position_id: { $in: positionIds } });
    }
  }

  // Add position conditions to AND array if any exist
  if (positionConditions.length > 0) {
    andConditions.push({ $or: positionConditions });
  }

  // Apply the AND conditions to the filter if any exist
  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  // 2. Build sort options
  let sortOptions = {};

  // Handle random sort separately
  if (sort_by === 'random') {
    // For random sorting, we use MongoDB's $sample aggregation
    // This will be handled differently in the service layer
    sortOptions = null; // We'll use a different approach for random sorting
  } else {
    // Standard sorting
    sortOptions[sort_by] = sort_direction === 'asc' ? 1 : -1;
  }

  // 3. Calculate pagination parameters
  const skip = (page - 1) * pageSize;
  const limit = pageSize;

  return { filter, sortOptions, skip, limit };
}

module.exports = {
  buildMongoQuery,
  convertToObjectIds,
};
