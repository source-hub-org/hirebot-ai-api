/**
 * Candidate Repository Module
 * @module repository/candidateRepository
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('./baseRepository');
const candidateModel = require('../models/candidateModel');
const logger = require('../utils/logger');
const { formatCandidateDefaults } = require('../utils/candidateValidator');

/**
 * Insert a new candidate into the database
 * @async
 * @param {Object} candidateData - Candidate data to insert
 * @returns {Promise<Object>} Inserted candidate with ID
 * @throws {Error} If insertion fails
 */
async function insertCandidateToDB(candidateData) {
  try {
    // Format candidate with default values
    const formattedCandidate = formatCandidateDefaults(candidateData);

    // Insert into database
    const result = await baseRepository.insertOne(
      candidateModel.collectionName,
      formattedCandidate
    );

    if (!result.acknowledged) {
      throw new Error('Failed to insert candidate');
    }

    // Return the inserted candidate with ID
    return {
      _id: result.insertedId,
      ...formattedCandidate,
    };
  } catch (error) {
    logger.error('Error inserting candidate:', error);
    throw error;
  }
}

/**
 * Get a list of candidates with pagination
 * @async
 * @param {Object} [options={}] - Query options including pagination
 * @param {number} [options.skip=0] - Number of documents to skip
 * @param {number} [options.limit=0] - Maximum number of documents to return
 * @returns {Promise<{candidates: Array<Object>, total: number}>} Array of candidates and total count
 * @throws {Error} If retrieval fails
 */
async function getCandidateList(options = {}) {
  try {
    const { skip = 0, limit = 0 } = options;

    // Get the collection
    const collection = baseRepository.getCollection(candidateModel.collectionName);

    // Execute queries in parallel for better performance
    const [candidates, total] = await Promise.all([
      // Get paginated candidates
      collection.find({}).skip(skip).limit(limit).toArray(),

      // Get total count
      collection.countDocuments({}),
    ]);

    return {
      candidates,
      total,
    };
  } catch (error) {
    logger.error('Error retrieving candidates:', error);
    throw error;
  }
}

/**
 * Get a candidate by ID
 * @async
 * @param {string} id - Candidate ID
 * @returns {Promise<Object|null>} Candidate object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getCandidateById(id) {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }

    return await baseRepository.findOne(candidateModel.collectionName, { _id: new ObjectId(id) });
  } catch (error) {
    logger.error(`Error retrieving candidate with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a candidate in the database
 * @async
 * @param {string} id - Candidate ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated candidate
 * @throws {Error} If update fails
 */
async function updateCandidateInDB(id, updateData) {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid candidate ID');
    }

    // Update the candidate
    const result = await baseRepository.updateOne(
      candidateModel.collectionName,
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      throw new Error('Failed to update candidate');
    }

    if (result.matchedCount === 0) {
      return null; // No candidate found with this ID
    }

    // Return the updated candidate
    return await getCandidateById(id);
  } catch (error) {
    logger.error(`Error updating candidate with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a candidate by ID
 * @async
 * @param {string} id - Candidate ID
 * @returns {Promise<boolean>} True if deletion was successful
 * @throws {Error} If deletion fails
 */
async function deleteCandidateById(id) {
  try {
    if (!ObjectId.isValid(id)) {
      throw new Error('Invalid candidate ID');
    }

    const result = await baseRepository.deleteOne(candidateModel.collectionName, {
      _id: new ObjectId(id),
    });

    if (!result.acknowledged) {
      throw new Error('Failed to delete candidate');
    }

    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting candidate with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Check if a candidate exists by email
 * @async
 * @param {string} email - Candidate email
 * @param {string} [excludeId] - Optional ID to exclude from the check
 * @returns {Promise<boolean>} True if a candidate with this email exists
 */
async function candidateExistsByEmail(email, excludeId = null) {
  try {
    const query = { email };

    // If excludeId is provided, exclude that candidate from the check
    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const candidate = await baseRepository.findOne(candidateModel.collectionName, query);
    return !!candidate;
  } catch (error) {
    logger.error(`Error checking candidate existence by email ${email}:`, error);
    throw error;
  }
}

module.exports = {
  insertCandidateToDB,
  getCandidateList,
  getCandidateById,
  updateCandidateInDB,
  deleteCandidateById,
  candidateExistsByEmail,
};
