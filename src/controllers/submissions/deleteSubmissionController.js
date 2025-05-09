/**
 * Delete Submission Controller
 * @module controllers/submissions/deleteSubmissionController
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../../repository/baseRepository');
const submissionModel = require('../../models/submissionModel');
const { getSubmissionById } = require('../../repository/submissionRepository');
const logger = require('../../utils/logger');

/**
 * Delete a submission by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Response indicating success or failure
 */
const deleteSubmission = async (req, res) => {
  try {
    const submissionId = req.params.id;

    // Check if ID is valid
    if (!ObjectId.isValid(submissionId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid submission ID format',
      });
    }

    // Check if submission exists
    const existingSubmission = await getSubmissionById(submissionId);
    if (!existingSubmission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
        details: `Submission with ID ${submissionId} does not exist`,
      });
    }

    // Delete submission
    const result = await baseRepository.deleteOne(submissionModel.collectionName, {
      _id: new ObjectId(submissionId),
    });

    if (!result.acknowledged || result.deletedCount === 0) {
      return res.status(500).json({
        success: false,
        error: 'Failed to delete submission',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Submission deleted successfully',
    });
  } catch (error) {
    logger.error(`Error in DELETE /submissions/${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete submission',
    });
  }
};

module.exports = {
  deleteSubmission,
};
