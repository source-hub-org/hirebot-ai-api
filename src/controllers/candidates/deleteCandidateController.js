/**
 * Delete Candidate Controller
 * @module controllers/candidates/deleteCandidateController
 */

const { getCandidateById, deleteCandidateById } = require('../../repository/candidateRepository');
const logger = require('../../utils/logger');

/**
 * Check if candidate exists by ID
 * @param {string} id - Candidate ID
 * @returns {Promise<Object|null>} Candidate object or null
 */
const checkCandidateExists = async id => {
  return await getCandidateById(id);
};

/**
 * Delete a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Deletion confirmation
 */
const deleteCandidate = async (req, res) => {
  try {
    // Check if candidate exists
    const existingCandidate = await checkCandidateExists(req.params.id);

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Delete candidate
    const deleted = await deleteCandidateById(req.params.id);

    if (!deleted) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete candidate',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in DELETE /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete candidate',
    });
  }
};

module.exports = {
  deleteCandidate,
};
