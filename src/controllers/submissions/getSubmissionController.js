/**
 * Get Submission Controller
 * @module controllers/submissions/getSubmissionController
 */

const { getSubmissionById } = require('../../repository/submissionRepository');
const logger = require('../../utils/logger');

/**
 * Get a submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Submission details
 */
const getSubmissionByIdController = async (req, res) => {
  try {
    // Check if enrichment is requested
    const enrich = req.query.enrich === 'true';

    const submission = await getSubmissionById(req.params.id, enrich);

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(`Error in GET /submissions/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submission',
    });
  }
};

module.exports = {
  getSubmissionByIdController,
};
