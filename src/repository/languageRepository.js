/**
 * Language Repository Module
 * @module repository/languageRepository
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

// Collection name for languages
const LANGUAGES_COLLECTION = 'languages';

/**
 * Create a new language
 * @async
 * @param {Object} languageData - Language data to insert
 * @returns {Promise<Object>} Created language with ID
 * @throws {Error} If language creation fails
 */
async function createLanguage(languageData) {
  try {
    logger.info('Creating new language');
    const result = await insertOne(LANGUAGES_COLLECTION, {
      ...languageData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (!result.acknowledged) {
      throw new Error('Failed to create language');
    }

    return {
      _id: result.insertedId,
      ...languageData,
    };
  } catch (error) {
    logger.error('Error creating language:', error);
    throw error;
  }
}

/**
 * Get all languages with optional filtering
 * @async
 * @param {Object} [filter={}] - Filter criteria
 * @param {Object} [options={}] - Query options (sorting, pagination)
 * @returns {Promise<Array<Object>>} Array of language objects
 * @throws {Error} If retrieval fails
 */
async function getAllLanguages(filter = {}, options = {}) {
  try {
    logger.info('Retrieving languages with filter:', filter);
    return await findMany(LANGUAGES_COLLECTION, filter, options);
  } catch (error) {
    logger.error('Error retrieving languages:', error);
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
async function getLanguageById(id) {
  try {
    logger.info(`Retrieving language with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid language ID format: ${id}`);
      return null;
    }

    return await findOne(LANGUAGES_COLLECTION, { _id: new ObjectId(id) });
  } catch (error) {
    logger.error(`Error retrieving language with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get a language by name
 * @async
 * @param {string} name - Language name
 * @returns {Promise<Object|null>} Language object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getLanguageByName(name) {
  try {
    logger.info(`Retrieving language with name: ${name}`);
    return await findOne(LANGUAGES_COLLECTION, { name });
  } catch (error) {
    logger.error(`Error retrieving language with name ${name}:`, error);
    throw error;
  }
}

/**
 * Get a language by slug
 * @async
 * @param {string} slug - Language slug
 * @returns {Promise<Object|null>} Language object or null if not found
 * @throws {Error} If retrieval fails
 */
async function getLanguageBySlug(slug) {
  try {
    logger.info(`Retrieving language with slug: ${slug}`);
    return await findOne(LANGUAGES_COLLECTION, { slug });
  } catch (error) {
    logger.error(`Error retrieving language with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Update a language by ID
 * @async
 * @param {string} id - Language ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated language or null if not found
 * @throws {Error} If update fails
 */
async function updateLanguage(id, updateData) {
  try {
    logger.info(`Updating language with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid language ID format: ${id}`);
      return null;
    }

    const result = await updateOne(
      LANGUAGES_COLLECTION,
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (!result.acknowledged) {
      throw new Error(`Failed to update language with ID ${id}`);
    }

    if (result.matchedCount === 0) {
      logger.warn(`Language with ID ${id} not found`);
      return null;
    }

    return await getLanguageById(id);
  } catch (error) {
    logger.error(`Error updating language with ID ${id}:`, error);
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
async function deleteLanguage(id) {
  try {
    logger.info(`Deleting language with ID: ${id}`);

    if (!ObjectId.isValid(id)) {
      logger.warn(`Invalid language ID format: ${id}`);
      return false;
    }

    const result = await deleteOne(LANGUAGES_COLLECTION, { _id: new ObjectId(id) });

    if (!result.acknowledged) {
      throw new Error(`Failed to delete language with ID ${id}`);
    }

    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting language with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Clear all languages from the database
 * @async
 * @returns {Promise<import('mongodb').DeleteResult>} Result of the delete operation
 */
async function clearAllLanguages() {
  logger.info('Clearing all languages from the database');
  return await deleteMany(LANGUAGES_COLLECTION, {});
}

/**
 * Insert multiple languages into the database
 * @async
 * @param {Array<Object>} languages - Array of language objects to insert
 * @returns {Promise<import('mongodb').InsertManyResult|Object>} Result of the insert operation
 */
async function insertLanguages(languages) {
  logger.info(`Inserting ${languages.length} languages into the database`);

  // Handle empty array case
  if (!languages || languages.length === 0) {
    return { acknowledged: true, insertedCount: 0 };
  }

  return await insertMany(LANGUAGES_COLLECTION, languages);
}

module.exports = {
  createLanguage,
  getAllLanguages,
  getLanguageById,
  getLanguageByName,
  getLanguageBySlug,
  updateLanguage,
  deleteLanguage,
  clearAllLanguages,
  insertLanguages,
};
