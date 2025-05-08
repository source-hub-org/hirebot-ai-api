/**
 * Instrument Tag Repository Module
 * @module repository/instrumentTagRepository
 */

const InstrumentTag = require('../models/instrumentTagModel');
const logger = require('../utils/logger');

/**
 * Create a new instrument tag
 * @async
 * @param {Object} tagData - Data for the new tag
 * @returns {Promise<Object>} Created tag document
 */
async function createInstrumentTag(tagData) {
  logger.info('Creating new instrument tag');
  return await InstrumentTag.create(tagData);
}

/**
 * Get all instrument tags
 * @async
 * @returns {Promise<Array<Object>>} Array of tag documents
 */
async function getAllInstrumentTags() {
  logger.info('Retrieving all instrument tags');
  return await InstrumentTag.find();
}

/**
 * Get instrument tag by ID
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object|null>} Tag document or null if not found
 */
async function getInstrumentTagById(id) {
  logger.info(`Retrieving instrument tag with ID: ${id}`);
  return await InstrumentTag.findById(id);
}

/**
 * Update instrument tag by ID
 * @async
 * @param {string} id - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated tag document or null if not found
 */
async function updateInstrumentTag(id, updateData) {
  logger.info(`Updating instrument tag with ID: ${id}`);
  return await InstrumentTag.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

/**
 * Delete instrument tag by ID
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object|null>} Deleted tag document or null if not found
 */
async function deleteInstrumentTag(id) {
  logger.info(`Deleting instrument tag with ID: ${id}`);
  return await InstrumentTag.findByIdAndDelete(id);
}

/**
 * Get instrument tags by IDs
 * @async
 * @param {Array<string>} ids - Array of tag IDs
 * @returns {Promise<Array<Object>>} Array of tag documents
 */
async function getInstrumentTagsByIds(ids) {
  logger.info(`Retrieving instrument tags with IDs: ${ids.join(', ')}`);
  return await InstrumentTag.find({ _id: { $in: ids } });
}

module.exports = {
  createInstrumentTag,
  getAllInstrumentTags,
  getInstrumentTagById,
  updateInstrumentTag,
  deleteInstrumentTag,
  getInstrumentTagsByIds,
};
