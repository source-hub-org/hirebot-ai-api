/**
 * Update Candidate Controller
 * @module controllers/candidates/updateCandidateController
 */

const { validateCandidateInput, sanitizeUpdateData } = require('../../utils/candidateValidator');
const {
  getCandidateById,
  updateCandidateInDB,
  candidateExistsByEmail,
} = require('../../repository/candidateRepository');
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
 * Validate candidate update data
 * @param {Object} existingCandidate - Existing candidate data
 * @param {Object} updateData - Data to update
 * @returns {Object} Validation result
 */
const validateCandidateUpdate = (existingCandidate, updateData) => {
  return validateCandidateInput({
    ...existingCandidate,
    ...updateData,
  });
};

/**
 * Check if email is already in use by another candidate
 * @param {string} email - Email to check
 * @param {string} candidateId - Current candidate ID
 * @returns {Promise<boolean>} True if email exists for another candidate
 */
const checkEmailInUse = async (email, candidateId) => {
  return await candidateExistsByEmail(email, candidateId);
};

/**
 * Update a candidate
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Updated candidate
 */
const updateCandidate = async (req, res) => {
  try {
    // Check if candidate exists
    const existingCandidate = await checkCandidateExists(req.params.id);

    if (!existingCandidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found',
      });
    }

    // Validate input
    const validation = validateCandidateUpdate(existingCandidate, req.body);

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validation.errors,
      });
    }

    // Check if email is being changed and if it's already in use
    if (req.body.email && req.body.email !== existingCandidate.email) {
      const emailExists = await checkEmailInUse(req.body.email, req.params.id);
      if (emailExists) {
        return res.status(409).json({
          success: false,
          error: 'This email is already in use by another candidate',
        });
      }
    }

    // Sanitize update data
    const updateData = sanitizeUpdateData(req.body);

    // Update candidate
    const updatedCandidate = await updateCandidateInDB(req.params.id, updateData);

    res.status(200).json({
      success: true,
      data: updatedCandidate,
      message: 'Candidate updated successfully',
    });
  } catch (error) {
    logger.error(`Error in PUT /candidates/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to update candidate',
    });
  }
};

module.exports = {
  updateCandidate,
};
