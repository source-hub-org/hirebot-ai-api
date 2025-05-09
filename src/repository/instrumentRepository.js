/**
 * Instrument Repository Module
 * @module repository/instrumentRepository
 */

const Instrument = require('../models/instrumentModel');
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * Get the MongoDB collection for instruments
 * @returns {Object} MongoDB collection
 */
function getCollection(collectionName = 'instruments') {
  return mongoose.connection.db.collection(collectionName);
}

/**
 * Create a new instrument
 * @async
 * @param {Object} instrumentData - Data for the new instrument
 * @returns {Promise<Object>} Created instrument document
 */
async function createInstrument(instrumentData) {
  logger.info('Creating new instrument');
  return await Instrument.create(instrumentData);
}

/**
 * Get all instruments
 * @async
 * @param {Object} [filter={}] - Filter criteria
 * @param {Object} [options={}] - Query options
 * @returns {Promise<Array<Object>>} Array of instrument documents
 */
async function getAllInstruments(filter = {}, options = {}) {
  logger.info('Retrieving all instruments');

  const query = Instrument.find(filter);

  // Apply population if specified
  if (options.populate && options.populate.includes('tags')) {
    query.populate('tags');
  }

  // Apply pagination if specified
  if (options.limit) {
    query.limit(options.limit);
  }

  if (options.skip) {
    query.skip(options.skip);
  }

  // Apply sorting if specified
  if (options.sort) {
    query.sort(options.sort);
  }

  return await query.exec();
}

/**
 * Get instrument by ID
 * @async
 * @param {string} id - Instrument ID
 * @param {Object} [options={}] - Query options
 * @returns {Promise<Object|null>} Instrument document or null if not found
 */
async function getInstrumentById(id, options = {}) {
  logger.info(`Retrieving instrument with ID: ${id}`);

  const query = Instrument.findById(id);

  // Apply population if specified
  if (options.populate && options.populate.includes('tags')) {
    query.populate('tags');
  }

  return await query.exec();
}

/**
 * Get instruments by tag ID
 * @async
 * @param {string} tagId - Tag ID
 * @param {Object} [options={}] - Query options
 * @returns {Promise<Array<Object>>} Array of instrument documents
 */
async function getInstrumentsByTagId(tagId, options = {}) {
  logger.info(`Retrieving instruments with tag ID: ${tagId}`);

  const query = Instrument.find({ tags: tagId });

  // Apply population if specified
  if (options.populate && options.populate.includes('tags')) {
    query.populate('tags');
  }

  // Apply pagination if specified
  if (options.limit) {
    query.limit(options.limit);
  }

  if (options.skip) {
    query.skip(options.skip);
  }

  // Apply sorting if specified
  if (options.sort) {
    query.sort(options.sort);
  }

  return await query.exec();
}

/**
 * Update instrument by ID
 * @async
 * @param {string} id - Instrument ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object|null>} Updated instrument document or null if not found
 */
async function updateInstrument(id, updateData) {
  logger.info(`Updating instrument with ID: ${id}`);
  return await Instrument.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('tags');
}

/**
 * Delete instrument by ID
 * @async
 * @param {string} id - Instrument ID
 * @returns {Promise<Object|null>} Deleted instrument document or null if not found
 */
async function deleteInstrument(id) {
  logger.info(`Deleting instrument with ID: ${id}`);
  return await Instrument.findByIdAndDelete(id);
}

/**
 * Count instruments
 * @async
 * @param {Object} [filter={}] - Filter criteria
 * @returns {Promise<number>} Count of instruments
 */
async function countInstruments(filter = {}) {
  logger.info('Counting instruments');
  return await Instrument.countDocuments(filter);
}

/**
 * Count instruments by tag ID
 * @async
 * @param {string} tagId - Tag ID
 * @returns {Promise<number>} Count of instruments with the specified tag
 */
async function countInstrumentsByTagId(tagId) {
  logger.info(`Counting instruments with tag ID: ${tagId}`);
  return await Instrument.countDocuments({ tags: tagId });
}

module.exports = {
  createInstrument,
  getAllInstruments,
  getInstrumentById,
  getInstrumentsByTagId,
  updateInstrument,
  deleteInstrument,
  countInstruments,
  countInstrumentsByTagId,
  getCollection,
};
