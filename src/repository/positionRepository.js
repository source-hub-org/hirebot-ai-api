/**
 * Position Repository Module
 * @module repository/positionRepository
 */

const { ObjectId } = require('mongodb');
const {
  getCollection,
  insertOne,
  findMany,
  findOne,
  updateOne,
  deleteOne,
  deleteMany,
  insertMany,
} = require('./baseRepository');
const logger = require('../utils/logger');

// Collection name for positions
const POSITIONS_COLLECTION = 'positions';

/**
 * Create a new position
 * @async
 * @param {Object} positionData - Position data to insert
 * @returns {Promise<Object>} Created position with ID
 * @throws {Error} If position creation fails
 */
async function createPosition(positionData) {
  try {
    logger.info('Creating new position');
    const result = await insertOne(POSITIONS_COLLECTION, {
      ...positionData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error('Failed to create position');
    }

    return {
      _id: result.insertedId,
      ...positionData,
    };
  } catch (error) {
    logger.error('Error creating position:', error);
    throw error;
  }
}

/**
 * Get all positions with optional filtering
 * @async
 * @param {Object} [filter={}] - Filter criteria
 * @param {Object} [options={}] - Query options (sorting, pagination)
 * @returns {Promise<Array<Object>>} Array of position objects
 * @throws {Error} If retrieval fails
 */
async function getAllPositions(filter = {}, options = {}) {
  try {
    logger.info('Retrieving positions with filter:', filter);
    return await findMany(POSITIONS_COLLECTION, filter, options);
  } catch (error) {
    logger.error('Error retrieving positions:', error);
    throw error;
  }
}

/**
 * Get a position by ID
 * @async
 * @param {string} id - Position ID
 * @returns {Promise<Object|null>} Position object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getPositionById(id) {
  try {
    logger.info(`Retrieving position with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid position ID format: ${id}`);
      return null;
    }

    return await findOne(POSITIONS_COLLECTION, { _id: new ObjectId(id) });
  } catch (error) {
    logger.error(`Error retrieving position with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get a position by title
 * @async
 * @param {string} title - Position title
 * @returns {Promise<Object|null>} Position object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getPositionByTitle(title) {
  try {
    logger.info(`Retrieving position with title: ${title}`);
    return await findOne(POSITIONS_COLLECTION, { title });
  } catch (error) {
    logger.error(`Error retrieving position with title ${title}:`, error);
    throw error;
  }
}

/**
 * Get a position by slug
 * @async
 * @param {string} slug - Position slug
 * @returns {Promise<Object|null>} Position object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getPositionBySlug(slug) {
  try {
    logger.info(`Retrieving position with slug: ${slug}`);
    return await findOne(POSITIONS_COLLECTION, { slug });
  } catch (error) {
    logger.error(`Error retrieving position with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Update a position by ID
 * @async
 * @param {string} id - Position ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated position or null if not found
 * @throws {Error} If update fails
 */
async function updatePosition(id, updateData) {
  try {
    logger.info(`Updating position with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid position ID format: ${id}`);
      return null;
    }

    const result = await updateOne(
      POSITIONS_COLLECTION,
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.acknowledged) {
      throw new Error(`Failed to update position with ID ${id}`);
    }

    if (result.matchedCount === 0) {
      logger.warn(`Position with ID ${id} not found`);
      return null;
    }

    return await getPositionById(id);
  } catch (error) {
    logger.error(`Error updating position with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a position by ID
 * @async
 * @param {string} id - Position ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 * @throws {Error} If deletion fails
 */
async function deletePosition(id) {
  try {
    logger.info(`Deleting position with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid position ID format: ${id}`);
      return false;
    }

    const result = await deleteOne(POSITIONS_COLLECTION, { _id: new ObjectId(id) });

    if (!result.acknowledged) {
      throw new Error(`Failed to delete position with ID ${id}`);
    }

    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting position with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Clear all positions from the database
 * @async
 * @returns {Promise<import('mongodb').DeleteResult>} Result of the delete operation
 */
async function clearAllPositions() {
  logger.info('Clearing all positions from the database');
  return await deleteMany(POSITIONS_COLLECTION, {});
}

/**
 * Insert multiple positions into the database
 * @async
 * @param {Array<Object>} positions - Array of position objects to insert
 * @returns {Promise<import('mongodb').InsertManyResult|Object>} Result of the insert operation
 */
async function insertPositions(positions) {
  logger.info(`Inserting ${positions.length} positions into the database`);

  // Handle empty array case
  if (!positions || positions.length === 0) {
    return { acknowledged: true, insertedCount: 0 };
  }

  return await insertMany(POSITIONS_COLLECTION, positions);
}

module.exports = {
  createPosition,
  getAllPositions,
  getPositionById,
  getPositionByTitle,
  getPositionBySlug,
  updatePosition,
  deletePosition,
  clearAllPositions,
  insertPositions,
};
