/**
 * Logic Tag Repository Module
 * @module repository/logicTagRepository
 */

const LogicTag = require('../models/logicTagModel');
const logger = require('../utils/logger');

/**
 * Create a new logic tag
 * @async
 * @param {Object} tagData - Data for the new tag
 * @returns {Promise<Object>} Created tag document
 */
async function createLogicTag(tagData) {
  logger.info('Creating new logic tag');
  return await LogicTag.create(tagData);
}

/**
 * Get all logic tags
 * @async
 * @returns {Promise<Array<Object>>} Array of tag documents
 */
async function getAllLogicTags() {
  logger.info('Retrieving all logic tags');
  return await LogicTag.find().sort({ name: 1 });
}

/**
 * Get logic tag by ID
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object|null>} Tag document or null if not found
 */
async function getLogicTagById(id) {
  logger.info(`Retrieving logic tag with ID: ${id}`);
  return await LogicTag.findById(id);
}

/**
 * Get logic tag by slug
 * @async
 * @param {string} slug - Tag slug
 * @returns {Promise<Object|null>} Tag document or null if not found
 */
async function getLogicTagBySlug(slug) {
  logger.info(`Retrieving logic tag with slug: ${slug}`);
  return await LogicTag.findOne({ slug });
}

/**
 * Update logic tag by ID
 * @async
 * @param {string} id - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated tag document or null if not found
 */
async function updateLogicTag(id, updateData) {
  logger.info(`Updating logic tag with ID: ${id}`);
  return await LogicTag.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
}

/**
 * Delete logic tag by ID
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object|null>} Deleted tag document or null if not found
 */
async function deleteLogicTag(id) {
  logger.info(`Deleting logic tag with ID: ${id}`);
  return await LogicTag.findByIdAndDelete(id);
}

/**
 * Get logic tags by IDs
 * @async
 * @param {Array<string>} ids - Array of tag IDs
 * @returns {Promise<Array<Object>>} Array of tag documents
 */
async function getLogicTagsByIds(ids) {
  logger.info(`Retrieving logic tags with IDs: ${ids.join(', ')}`);
  return await LogicTag.find({ _id: { $in: ids } });
}

/**
 * Check if tags exist by IDs
 * @async
 * @param {Array<string>} ids - Array of tag IDs
 * @returns {Promise<boolean>} True if all tags exist, false otherwise
 */
async function checkLogicTagsExist(ids) {
  const tags = await getLogicTagsByIds(ids);
  return tags.length === ids.length;
}

module.exports = {
  createLogicTag,
  getAllLogicTags,
  getLogicTagById,
  getLogicTagBySlug,
  updateLogicTag,
  deleteLogicTag,
  getLogicTagsByIds,
  checkLogicTagsExist,
};
