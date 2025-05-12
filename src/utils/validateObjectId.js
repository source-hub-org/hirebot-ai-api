/**
 * ObjectId Validation Utility
 * @module utils/validateObjectId
 */

const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is a valid ObjectId, false otherwise
 */
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Converts a string to a MongoDB ObjectId if valid
 * @param {string} id - The ID to convert
 * @returns {mongoose.Types.ObjectId|null} The ObjectId if valid, null otherwise
 */
function toObjectId(id) {
  if (!isValidObjectId(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

/**
 * Validates an array of ObjectId strings
 * @param {Array<string>} ids - Array of IDs to validate
 * @returns {boolean} True if all IDs are valid ObjectIds, false otherwise
 */
function areValidObjectIds(ids) {
  if (!Array.isArray(ids)) return false;
  return ids.every(id => isValidObjectId(id));
}

/**
 * Converts an array of strings to MongoDB ObjectIds if valid
 * @param {Array<string>} ids - Array of IDs to convert
 * @returns {Array<mongoose.Types.ObjectId>} Array of ObjectIds (only valid ones)
 */
function toObjectIds(ids) {
  if (!Array.isArray(ids)) return [];
  return ids.filter(id => isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
}

module.exports = {
  isValidObjectId,
  toObjectId,
  areValidObjectIds,
  toObjectIds,
};
