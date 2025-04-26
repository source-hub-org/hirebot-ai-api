/**
 * Get Candidate Controller
 * @module controllers/candidates/getCandidateController
 */

const { getCandidateById } = require('../../repository/candidateRepository');
const logger = require('../../utils/logger');

/**
 * Get a candidate by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Candidate details
 */
const getCandidateByIdController = async (req, res) => {
  try {
    const candidate = await getCandidateById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    res.status(200).json({
      success: true,
      data: candidate,
    });
  } catch (error) {
    logger.error(`Error in GET /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve candidate',
    });
  }
};

module.exports = {
  getCandidateByIdController,
};
