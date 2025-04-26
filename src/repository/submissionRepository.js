/**
 * Submission Repository Module
 * @module repository/submissionRepository
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('./baseRepository');
const submissionModel = require('../models/submissionModel');
const logger = require('../utils/logger');
const { formatSubmissionDefaults } = require('../utils/submissionValidator');

/**
 * Insert a new submission into the database
 * @async
 * @param {Object} submissionData - Submission data to insert
 * @returns {Promise<Object>} Inserted submission with ID
 * @throws {Error} If insertion fails
 */
async function insertSubmissionToDB(submissionData) {
  try {
    // Format submission with default values
    const formattedSubmission = formatSubmissionDefaults(submissionData);

    // Insert into database
    const result = await baseRepository.insertOne(
      submissionModel.collectionName,
      formattedSubmission
    );

    if (!result.acknowledged) {
      throw new Error('Failed to insert submission');
    }

    // Return the inserted submission with ID
    return {
      _id: result.insertedId,
      ...formattedSubmission,
    };
  } catch (error) {
    logger.error('Error inserting submission:', error);
    throw error;
  }
}

/**
 * Get a submission by ID
 * @async
 * @param {string} id - Submission ID
 * @param {boolean} [enrich=false] - Whether to enrich the submission with candidate and question data
 * @returns {Promise<Object|null>} Submission object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getSubmissionById(id, enrich = false) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    const submission = await baseRepository.findOne(submissionModel.collectionName, {
      _id: new ObjectId(id),
    });

    if (!submission) {
      return null;
    }

    if (enrich) {
      const { enrichSubmission } = require('../utils/submissionEnricher');
      return await enrichSubmission(submission);
    }

    return submission;
  } catch (error) {
    logger.error(`Error retrieving submission with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get submissions by candidate ID
 * @async
 * @param {string} candidateId - Candidate ID
 * @param {boolean} [enrich=false] - Whether to enrich the submissions with candidate and question data
 * @returns {Promise<Array<Object>>} Array of submissions
 * @throws {Error} If retrieval fails
 */
async function getSubmissionsByCandidateId(candidateId, enrich = false) {
  try {
    if (!ObjectId.isValid(candidateId)) {
      return [];
    }

    const submissions = await baseRepository.findMany(submissionModel.collectionName, {
      candidate_id: candidateId,
    });

    if (enrich && submissions.length > 0) {
      const { enrichSubmissions } = require('../utils/submissionEnricher');
      return await enrichSubmissions(submissions);
    }

    return submissions;
  } catch (error) {
    logger.error(`Error retrieving submissions for candidate ${candidateId}:`, error);
    throw error;
  }
}

/**
 * Check if a candidate exists in the database
 * @async
 * @param {string} candidateId - Candidate ID to check
 * @returns {Promise<boolean>} True if candidate exists, false otherwise
 */
async function candidateExists(candidateId) {
  try {
    if (!ObjectId.isValid(candidateId)) {
      return false;
    }

    const candidate = await baseRepository.findOne('candidates', {
      _id: new ObjectId(candidateId),
    });

    return !!candidate;
  } catch (error) {
    logger.error(`Error checking candidate existence for ID ${candidateId}:`, error);
    throw error;
  }
}

/**
 * Check if questions exist in the database
 * @async
 * @param {Array<string>} questionIds - Array of question IDs to check
 * @returns {Promise<{exists: boolean, missingIds: Array<string>}>} Result with exists flag and array of missing IDs
 */
async function questionsExist(questionIds) {
  try {
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return { exists: true, missingIds: [] };
    }

    const validQuestionIds = questionIds.filter(id => ObjectId.isValid(id));

    if (validQuestionIds.length === 0) {
      return {
        exists: false,
        missingIds: questionIds,
      };
    }

    const objectIds = validQuestionIds.map(id => new ObjectId(id));

    const questions = await baseRepository.findMany('questions', {
      _id: { $in: objectIds },
    });

    const foundIds = questions.map(q => q._id.toString());
    const missingIds = validQuestionIds.filter(id => !foundIds.includes(id));

    return {
      exists: missingIds.length === 0,
      missingIds,
    };
  } catch (error) {
    logger.error(`Error checking questions existence:`, error);
    throw error;
  }
}

module.exports = {
  insertSubmissionToDB,
  getSubmissionById,
  getSubmissionsByCandidateId,
  candidateExists,
  questionsExist,
};
