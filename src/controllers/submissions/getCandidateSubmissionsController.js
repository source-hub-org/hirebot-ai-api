/**
 * Get Candidate Submissions Controller
 * @module controllers/submissions/getCandidateSubmissionsController
 */

const {
  candidateExists,
  getSubmissionsByCandidateId,
} = require('../../repository/submissionRepository');
const logger = require('../../utils/logger');

/**
 * Check if candidate exists
 * @param {string} candidateId - Candidate ID
 * @returns {Promise<boolean>} True if candidate exists
 */
const checkCandidateExists = async candidateId => {
  return await candidateExists(candidateId);
};

/**
 * Get submissions by candidate ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} List of submissions for the candidate
 */
const getCandidateSubmissions = async (req, res) => {
  try {
    const candidateId = req.params.candidateId;

    // Check if candidate exists
    const candidateFound = await checkCandidateExists(candidateId);

    if (!candidateFound) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Check if enrichment is requested
    const enrich = req.query.enrich === 'true';

    const submissions = await getSubmissionsByCandidateId(candidateId, enrich);

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error(`Error in GET /submissions/candidate/${req.params.candidateId}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve submissions',
    });
  }
};

module.exports = {
  getCandidateSubmissions,
};
