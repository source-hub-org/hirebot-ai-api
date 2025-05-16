/**
 * Language Service Module
 * @module service/languageService
 */

const Language = require('../models/languageModel');
const {
  createLanguage,
  getAllLanguages,
  getLanguageById,
  getLanguageByName,
  getLanguageBySlug,
  updateLanguage,
  deleteLanguage,
} = require('../repository/languageRepository');
const logger = require('../utils/logger');

/**
 * Create a new language
 * @async
 * @param {Object} languageData - Language data to create
 * @returns {Promise<Object>} Created language
 * @throws {Error} If validation fails or creation fails
 */
async function createLanguageService(languageData) {
  try {
    logger.info('Creating new language in service');

    // Check if language with the same name already exists
    const existingLanguage = await getLanguageByName(languageData.name);
    if (existingLanguage) {
      throw new Error(`Language with name '${languageData.name}' already exists`);
    }

    // Generate slug if not provided
    if (!languageData.slug) {
      languageData.slug = languageData.name.toLowerCase().replace(/\s+/g, '-');
    }

    // Check if language with the same slug already exists
    const existingSlug = await getLanguageBySlug(languageData.slug);
    if (existingSlug) {
      throw new Error(`Language with slug '${languageData.slug}' already exists`);
    }

    // Validate using Mongoose model
    const language = new Language(languageData);
    await language.validate();

    // Create language using repository
    return await createLanguage(languageData);
  } catch (error) {
    logger.error('Error in create language service:', error);
    throw error;
  }
}

/**
 * Get all languages with optional filtering
 * @async
 * @param {Object} [queryParams={}] - Query parameters for filtering
 * @returns {Promise<Object>} Object containing languages array and total count
 * @throws {Error} If retrieval fails
 */
async function getAllLanguagesService(queryParams = {}) {
  try {
    logger.info('Getting all languages in service with params:', queryParams);

    // Build filter object from query parameters
    const filter = buildFilterFromQuery(queryParams);

    // Build options object (sorting, pagination)
    const options = buildOptionsFromQuery(queryParams);

    // Get languages with pagination
    const languages = await getAllLanguages(filter, options);

    // Get total count for accurate pagination
    const { getCollection } = require('../repository/baseRepository');
    const collection = getCollection('languages');
    const totalCount = await collection.countDocuments(filter);

    return {
      languages,
      totalCount,
    };
  } catch (error) {
    logger.error('Error in get all languages service:', error);
    throw error;
  }
}

/**
 * Get a language by ID
 * @async
 * @param {string} id - Language ID
 * @returns {Promise<Object|null>} Language object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getLanguageByIdService(id) {
  try {
    logger.info(`Getting language by ID in service: ${id}`);
    return await getLanguageById(id);
  } catch (error) {
    logger.error(`Error in get language by ID service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Update a language by ID
 * @async
 * @param {string} id - Language ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated language or null if not found
 * @throws {Error} If validation fails or update fails
 */
async function updateLanguageService(id, updateData) {
  try {
    logger.info(`Updating language in service with ID: ${id}`);

    // Get existing language to validate the update
    const existingLanguage = await getLanguageById(id);

    if (!existingLanguage) {
      logger.warn(`Language with ID ${id} not found for update`);
      return null;
    }

    // If name is being updated, check if it already exists
    if (updateData.name && updateData.name !== existingLanguage.name) {
      const languageWithName = await getLanguageByName(updateData.name);
      if (languageWithName && languageWithName._id.toString() !== id) {
        throw new Error(`Language with name '${updateData.name}' already exists`);
      }
    }

    // If slug is being updated, check if it already exists
    if (updateData.slug && updateData.slug !== existingLanguage.slug) {
      const languageWithSlug = await getLanguageBySlug(updateData.slug);
      if (languageWithSlug && languageWithSlug._id.toString() !== id) {
        throw new Error(`Language with slug '${updateData.slug}' already exists`);
      }
    }

    // Generate slug if name is updated but slug is not provided
    if (updateData.name && !updateData.slug) {
      updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, '-');
    }

    // Validate the updated data using Mongoose model
    // Create a copy without _id to avoid ObjectId validation issues in tests
    const { _id, ...existingLanguageWithoutId } = existingLanguage;
    const updatedLanguageData = { ...existingLanguageWithoutId, ...updateData };
    const language = new Language(updatedLanguageData);
    await language.validate();

    // Update language using repository
    return await updateLanguage(id, updateData);
  } catch (error) {
    logger.error(`Error in update language service for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a language by ID
 * @async
 * @param {string} id - Language ID
 * @returns {Promise<boolean>} True if deleted, false if not found
 * @throws {Error} If deletion fails
 */
async function deleteLanguageService(id) {
  try {
    logger.info(`Deleting language in service with ID: ${id}`);
    return await deleteLanguage(id);
  } catch (error) {
    logger.error(`Error in delete language service for ID ${id}:`, error);
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
  if (queryParams.name) {
    filter.name = { $regex: queryParams.name, $options: 'i' };
  }

  if (queryParams.designed_by) {
    filter.designed_by = { $regex: queryParams.designed_by, $options: 'i' };
  }

  if (queryParams.first_appeared) {
    filter.first_appeared = parseInt(queryParams.first_appeared);
  }

  if (queryParams.paradigm) {
    filter.paradigm = { $in: [queryParams.paradigm] };
  }

  if (queryParams.popularity_rank) {
    filter.popularity_rank = parseInt(queryParams.popularity_rank);
  }

  if (queryParams.type_system) {
    filter.type_system = { $regex: queryParams.type_system, $options: 'i' };
  }

  if (queryParams.slug) {
    filter.slug = { $regex: queryParams.slug, $options: 'i' };
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
  if (queryParams.sort_by) {
    const sort_direction = queryParams.sort_direction === 'desc' ? -1 : 1;
    options.sort = { [queryParams.sort_by]: sort_direction };
  } else {
    // Default sort by popularity_rank ascending
    options.sort = { popularity_rank: 1 };
  }

  // Add pagination
  const page = parseInt(queryParams.page) || 1;
  const page_size = parseInt(queryParams.page_size) || parseInt(queryParams.limit) || 10;
  options.skip = (page - 1) * page_size;
  options.limit = page_size;

  return options;
}

module.exports = {
  createLanguageService,
  getAllLanguagesService,
  getLanguageByIdService,
  updateLanguageService,
  deleteLanguageService,
};
