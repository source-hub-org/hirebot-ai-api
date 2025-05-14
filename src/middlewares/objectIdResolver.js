/**
 * Object ID Resolver Middleware
 * @module middlewares/objectIdResolver
 * @description Middleware to resolve object IDs from names and vice versa
 */

const logger = require('../utils/logger');
const {
  resolveTopicData,
  resolveLanguageData,
  resolvePositionData,
} = require('../utils/objectIdResolverUtils');

/**
 * Middleware to resolve object IDs from names and vice versa
 * @async
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
async function objectIdResolverMiddleware(req, res, next) {
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
    const resolvedTopicData = await resolveTopicData(req, topicId, topicTitle);

    // Resolve language data
    const resolvedLanguageData = await resolveLanguageData(req, languageId, languageName);

    // Resolve position data
    const resolvedPositionData = await resolvePositionData(req, positionId, positionTitle);

    // Update request data with resolved values
    if (isPostRequest) {
      req.body.topic_id = resolvedTopicData.topic_id;
      req.body.topic = resolvedTopicData.topic;
      req.body.language_id = resolvedLanguageData.language_id;
      req.body.language = resolvedLanguageData.language;
      req.body.position_id = resolvedPositionData.position_id;
      req.body.position = resolvedPositionData.position;
    } else {
      req.query.topic_id = resolvedTopicData.topic_id;
      req.query.topic = resolvedTopicData.topic;
      req.query.language_id = resolvedLanguageData.language_id;
      req.query.language = resolvedLanguageData.language;
      req.query.position_id = resolvedPositionData.position_id;
      req.query.position = resolvedPositionData.position;
    }

    next();
  } catch (error) {
    logger.error('Error in objectIdResolverMiddleware:', error);
    next(error);
  }
}

module.exports = objectIdResolverMiddleware;
