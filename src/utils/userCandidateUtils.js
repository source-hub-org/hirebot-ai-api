/**
 * User-Candidate Utilities
 * @module utils/userCandidateUtils
 */

const Candidate = require('../models/candidateSchema');
const userRepository = require('../repository/userRepository');
const logger = require('./logger');

/**
 * Find a candidate by email
 * @async
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} - The candidate or null if not found
 */
async function findCandidateByEmail(email) {
  try {
    return await Candidate.findOne({ email: email.toLowerCase() }).exec();
  } catch (error) {
    logger.error(`Error finding candidate by email ${email}:`, error);
    throw error;
  }
}

/**
 * Create a new candidate with minimal information
 * @async
 * @param {string} email - The email for the new candidate
 * @returns {Promise<Object>} - The created candidate
 */
async function createMinimalCandidate(email) {
  try {
    // Create a minimal candidate record with just the email
    const candidate = new Candidate({ email });
    return await candidate.save();
  } catch (error) {
    logger.error(`Error creating minimal candidate with email ${email}:`, error);
    throw error;
  }
}

/**
 * Link a user to a candidate by updating the user's candidate_id field
 * @async
 * @param {string} userId - The user ID
 * @param {string} candidateId - The candidate ID
 * @returns {Promise<Object>} - The updated user
 */
async function linkUserToCandidate(userId, candidateId) {
  try {
    // Update the user with the candidate ID
    return await userRepository.update(userId, { candidate_id: candidateId });
  } catch (error) {
    logger.error(`Error linking user ${userId} to candidate ${candidateId}:`, error);
    throw error;
  }
}

/**
 * Find or create a candidate for a user and link them
 * @async
 * @param {Object} user - The user object
 * @returns {Promise<Object>} - The updated user with candidate_id
 */
async function findOrCreateCandidateForUser(user) {
  try {
    // Check if a candidate with this email already exists
    const existingCandidate = await findCandidateByEmail(user.email);

    if (existingCandidate) {
      // If candidate exists, link the user to this candidate
      return await linkUserToCandidate(user._id, existingCandidate._id);
    } else {
      // If no candidate exists, create a new one and link it
      const newCandidate = await createMinimalCandidate(user.email);
      return await linkUserToCandidate(user._id, newCandidate._id);
    }
  } catch (error) {
    logger.error(`Error in findOrCreateCandidateForUser for user ${user._id}:`, error);
    throw error;
  }
}

module.exports = {
  findCandidateByEmail,
  createMinimalCandidate,
  linkUserToCandidate,
  findOrCreateCandidateForUser,
};
