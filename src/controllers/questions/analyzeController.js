/**
 * Analyze Questions Controller
 * @module controllers/questions/analyzeController
 */

const { getCollection } = require('../../repository/baseRepository');
const logger = require('../../utils/logger');

/**
 * Formats the success response
 * @param {Object} data - Analysis data
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = data => {
  return {
    status: 'success',
    message: 'Question analysis completed successfully.',
    data: data,
  };
};

/**
 * Formats the error response
 * @param {Error} error - Error object
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = error => {
  return {
    status: 'error',
    message: 'An error occurred while analyzing questions.',
    error: error.message,
  };
};

/**
 * Controller to analyze questions collection
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response with analysis data or error
 * @description
 * - Performs statistical analysis on the questions collection
 * - Returns counts by various dimensions (position, language, difficulty, etc.)
 */
const analyzeQuestionsController = async (req, res) => {
  try {
    const questionsCollection = getCollection('questions');

    // Define the aggregation pipeline
    const pipeline = [
      {
        $facet: {
          // 3.1. Total number of questions
          total: [{ $count: 'count' }],

          // 3.2. Total number of questions by position
          byPosition: [
            {
              $group: {
                _id: { $ifNull: ['$position', 'Unknown'] },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          // 3.3. Total number of questions by language
          byLanguage: [
            {
              $group: {
                _id: { $ifNull: ['$language', 'Unknown'] },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          // 3.4. Total number of questions by difficulty
          byDifficulty: [
            {
              $group: {
                _id: { $ifNull: ['$difficulty', 'Unknown'] },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          // 3.5. Total number of questions by category
          byCategory: [
            {
              $group: {
                _id: { $ifNull: ['$category', 'Unknown'] },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          // 3.6. Total number of questions by topic
          byTopic: [
            {
              $group: {
                _id: { $ifNull: ['$topic', 'Unknown'] },
                count: { $sum: 1 },
              },
            },
            { $sort: { count: -1 } },
          ],

          // 3.7. Total number of questions by creation date (grouped by day)
          byDate: [
            {
              $project: {
                dateWithoutTime: {
                  $dateToString: {
                    format: '%Y-%m-%d',
                    date: { $ifNull: ['$createdAt', new Date()] },
                  },
                },
              },
            },
            {
              $group: {
                _id: '$dateWithoutTime',
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: -1 } },
          ],

          // 3.8. Total number of unique languages
          uniqueLanguages: [
            {
              $group: {
                _id: { $ifNull: ['$language', 'Unknown'] },
              },
            },
            { $count: 'count' },
          ],

          // 3.9. Total number of unique categories
          uniqueCategories: [
            {
              $group: {
                _id: { $ifNull: ['$category', 'Unknown'] },
              },
            },
            { $count: 'count' },
          ],

          // For calculating average per position
          uniquePositions: [
            {
              $group: {
                _id: { $ifNull: ['$position', 'Unknown'] },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ];

    // Execute the aggregation
    const result = await questionsCollection.aggregate(pipeline).toArray();
    const analysisData = result[0];

    // Format the results
    const formattedData = {
      total: analysisData.total.length > 0 ? analysisData.total[0].count : 0,
      byPosition: Object.fromEntries(analysisData.byPosition.map(item => [item._id, item.count])),
      byLanguage: Object.fromEntries(analysisData.byLanguage.map(item => [item._id, item.count])),
      byDifficulty: Object.fromEntries(
        analysisData.byDifficulty.map(item => [item._id, item.count])
      ),
      byCategory: Object.fromEntries(analysisData.byCategory.map(item => [item._id, item.count])),
      byTopic: Object.fromEntries(analysisData.byTopic.map(item => [item._id, item.count])),
      byDate: Object.fromEntries(analysisData.byDate.map(item => [item._id, item.count])),
      uniqueLanguages:
        analysisData.uniqueLanguages.length > 0 ? analysisData.uniqueLanguages[0].count : 0,
      uniqueCategories:
        analysisData.uniqueCategories.length > 0 ? analysisData.uniqueCategories[0].count : 0,
    };

    // Calculate average per position
    const totalQuestions = formattedData.total;
    const uniquePositionsCount =
      analysisData.uniquePositions.length > 0 ? analysisData.uniquePositions[0].count : 1;
    formattedData.averagePerPosition = parseFloat(
      (totalQuestions / uniquePositionsCount).toFixed(2)
    );

    return res.status(200).json(formatSuccessResponse(formattedData));
  } catch (error) {
    logger.error('Error analyzing questions:', error);
    return res.status(500).json(formatErrorResponse(error));
  }
};

module.exports = {
  analyzeQuestionsController,
  formatSuccessResponse,
  formatErrorResponse,
};
