/**
 * Multi Object ID Resolver Middleware
 * @module middlewares/multiObjectIdResolver
 * @description Middleware to resolve multiple object IDs from names and vice versa (comma-separated)
 */

const logger = require('../utils/logger');
const {
  resolveTopicData,
  resolveLanguageData,
  resolvePositionData,
} = require('../utils/objectIdResolverUtils');

/**
 * Resolves multiple comma-separated values
 * @async
 * @param {Object} req - Express request object
 * @param {Function} resolverFn - The resolver function to use
 * @param {string|null} idsString - Comma-separated IDs
 * @param {string|null} namesString - Comma-separated names
 * @returns {Promise<Object>} Object containing resolved IDs and names
 */
async function resolveMultipleValues(req, resolverFn, idsString, namesString) {
  // If neither is provided, return empty values
  if (!idsString && !namesString) {
    return { ids: null, names: null };
  }

  // Initialize result arrays
  let resolvedIds = [];
  let resolvedNames = [];

  // Process IDs if provided
  if (idsString) {
    const ids = idsString.split(',').map(id => id.trim());

    // Resolve each ID
    for (const id of ids) {
      if (id) {
        const resolved = await resolverFn(req, id, null);
        if (resolved.topic_id || resolved.language_id || resolved.position_id) {
          // Add to results based on which resolver was used
          if ('topic_id' in resolved) {
            resolvedIds.push(resolved.topic_id);
            if (resolved.topic) resolvedNames.push(resolved.topic);
          } else if ('language_id' in resolved) {
            resolvedIds.push(resolved.language_id);
            if (resolved.language) resolvedNames.push(resolved.language);
          } else if ('position_id' in resolved) {
            resolvedIds.push(resolved.position_id);
            if (resolved.position) resolvedNames.push(resolved.position);
          }
        }
      }
    }
  }

  // Process names if provided
  if (namesString) {
    const names = namesString.split(',').map(name => name.trim());

    // Resolve each name
    for (const name of names) {
      if (name) {
        const resolved = await resolverFn(req, null, name);
        if (resolved.topic || resolved.language || resolved.position) {
          // Add to results based on which resolver was used
          if ('topic' in resolved) {
            if (resolved.topic_id) resolvedIds.push(resolved.topic_id);
            resolvedNames.push(resolved.topic);
          } else if ('language' in resolved) {
            if (resolved.language_id) resolvedIds.push(resolved.language_id);
            resolvedNames.push(resolved.language);
          } else if ('position' in resolved) {
            if (resolved.position_id) resolvedIds.push(resolved.position_id);
            resolvedNames.push(resolved.position);
          }
        }
      }
    }
  }

  // Remove duplicates
  resolvedIds = [...new Set(resolvedIds)];
  resolvedNames = [...new Set(resolvedNames)];

  return {
    ids: resolvedIds.length > 0 ? resolvedIds.join(',') : null,
    names: resolvedNames.length > 0 ? resolvedNames.join(',') : null,
  };
}

/**
 * Middleware to resolve multiple comma-separated object IDs from names and vice versa
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function multiObjectIdResolverMiddleware(req, res, next) {
  try {
    // Extract data from request body or query parameters
    const isPostRequest = req.method === 'POST';
    const requestData = isPostRequest ? req.body : req.query;

    // Extract topic, language, and position data
    const topicId = requestData.topic_id || null;
    const topicTitle = requestData.topic || null;
    const languageId = requestData.language_id || null;
    const languageName = requestData.language || null;
    const positionId = requestData.position_id || null;
    const positionTitle = requestData.position || null;

    // Resolve topic data
    const resolvedTopicData = await resolveMultipleValues(
      req,
      resolveTopicData,
      topicId,
      topicTitle
    );

    // Resolve language data
    const resolvedLanguageData = await resolveMultipleValues(
      req,
      resolveLanguageData,
      languageId,
      languageName
    );

    // Resolve position data
    const resolvedPositionData = await resolveMultipleValues(
      req,
      resolvePositionData,
      positionId,
      positionTitle
    );

    // Update request data with resolved values
    if (isPostRequest) {
      req.body.topic_id = resolvedTopicData.ids;
      req.body.topic = resolvedTopicData.names;
      req.body.language_id = resolvedLanguageData.ids;
      req.body.language = resolvedLanguageData.names;
      req.body.position_id = resolvedPositionData.ids;
      req.body.position = resolvedPositionData.names;
    } else {
      req.query.topic_id = resolvedTopicData.ids;
      req.query.topic = resolvedTopicData.names;
      req.query.language_id = resolvedLanguageData.ids;
      req.query.language = resolvedLanguageData.names;
      req.query.position_id = resolvedPositionData.ids;
      req.query.position = resolvedPositionData.names;
    }

    next();
  } catch (error) {
    logger.error('Error in multiObjectIdResolverMiddleware:', error);
    next(error);
  }
}

module.exports = multiObjectIdResolverMiddleware;
