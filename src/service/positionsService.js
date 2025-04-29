/**
 * Positions Service Module
 * @module service/positionsService
 */

const Position = require('../models/positionModel');
const {
  createPosition,
  getAllPositions,
  getPositionById,
  getPositionBySlug,
  updatePosition,
  deletePosition,
} = require('../repository/positionRepository');
const logger = require('../utils/logger');

/**
 * Create a new position
 * @async
 * @param {Object} positionData - Position data to create
 * @returns {Promise<Object>} Created position
 * @throws {Error} If validation fails or creation fails
 */
async function createPositionService(positionData) {
  try {
    logger.info('Creating new position in service');

    // Check if position with the same slug already exists
    const existingPosition = await getPositionBySlug(positionData.slug);
    if (existingPosition) {
      throw new Error(`Position with slug '${positionData.slug}' already exists`);
    }

    // Validate using Mongoose model
    const position = new Position(positionData);
    await position.validate();

    // Create position using repository
    return await createPosition(positionData);
  } catch (error) {
    logger.error('Error in create position service:', error);
    throw error;
  }
}

/**
 * Get all positions with optional filtering
 * @async
 * @param {Object} [queryParams={}] - Query parameters for filtering
 * @returns {Promise<Array<Object>>} Array of position objects
 * @throws {Error} If retrieval fails
 */
async function getAllPositionsService(queryParams = {}) {
  try {
    logger.info('Getting all positions in service with params:', queryParams);

    // Build filter object from query parameters
    const filter = buildFilterFromQuery(queryParams);

    // Build options object (sorting, pagination)
    const options = buildOptionsFromQuery(queryParams);

    return await getAllPositions(filter, options);
  } catch (error) {
    logger.error('Error in get all positions service:', error);
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
async function getPositionByIdService(id) {
  try {
    logger.info(`Getting position by ID in service: ${id}`);
    return await getPositionById(id);
  } catch (error) {
    logger.error(`Error in get position by ID service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a position by ID
 * @async
 * @param {string} id - Position ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated position or null if not found
 * @throws {Error} If validation fails or update fails
 */
async function updatePositionService(id, updateData) {
  try {
    logger.info(`Updating position in service with ID: ${id}`);

    // Get existing position to validate the update
    const existingPosition = await getPositionById(id);

    if (!existingPosition) {
      logger.warn(`Position with ID ${id} not found for update`);
      return null;
    }

    // If slug is being updated, check if it already exists
    if (updateData.slug && updateData.slug !== existingPosition.slug) {
      const positionWithSlug = await getPositionBySlug(updateData.slug);
      if (positionWithSlug && positionWithSlug._id.toString() !== id) {
        throw new Error(`Position with slug '${updateData.slug}' already exists`);
      }
    }

    // Validate the updated data using Mongoose model
    const updatedPositionData = { ...existingPosition, ...updateData };
    const position = new Position(updatedPositionData);
    await position.validate();

    // Update position using repository
    return await updatePosition(id, updateData);
  } catch (error) {
    logger.error(`Error in update position service for ID ${id}:`, error);
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
async function deletePositionService(id) {
  try {
    logger.info(`Deleting position in service with ID: ${id}`);
    return await deletePosition(id);
  } catch (error) {
    logger.error(`Error in delete position service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Build filter object from query parameters
 * @param {Object} queryParams - Query parameters
 * @returns {Object} Filter object for MongoDB query
 */
function buildFilterFromQuery(queryParams) {
  const filter = {};

  // Add filters based on query parameters
  if (queryParams.title) {
    filter.title = { $regex: queryParams.title, $options: 'i' };
  }

  if (queryParams.slug) {
    filter.slug = { $regex: queryParams.slug, $options: 'i' };
  }

  if (queryParams.level) {
    filter.level = parseInt(queryParams.level);
  }

  if (queryParams.is_active !== undefined) {
    filter.is_active = queryParams.is_active === 'true';
  }

  return filter;
}

/**
 * Build options object from query parameters
 * @param {Object} queryParams - Query parameters
 * @returns {Object} Options object for MongoDB query
 */
function buildOptionsFromQuery(queryParams) {
  const options = {};

  // Add sorting
  if (queryParams.sortBy) {
    const sortOrder = queryParams.sortOrder === 'desc' ? -1 : 1;
    options.sort = { [queryParams.sortBy]: sortOrder };
  } else {
    // Default sort by level ascending
    options.sort = { level: 1 };
  }

  // Add pagination
  const page = parseInt(queryParams.page) || 1;
  const limit = parseInt(queryParams.limit) || 10;
  options.skip = (page - 1) * limit;
  options.limit = limit;

  return options;
}

module.exports = {
  createPositionService,
  getAllPositionsService,
  getPositionByIdService,
  updatePositionService,
  deletePositionService,
};
