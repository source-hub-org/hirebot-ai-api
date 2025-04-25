/**
 * File Parser Module
 * @module utils/fileParser
 */

const fs = require('fs/promises');
const logger = require('./logger');

/**
 * Read and parse a JSON file from the given path
 * @async
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<Object>} Parsed JSON object
 * @throws {Error} If file reading or parsing fails
 */
async function readJsonFile(filePath) {
  try {
    logger.info(`Reading JSON file from: ${filePath}`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    } else if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format in file: ${filePath}`);
    }
    throw new Error(`Error reading file ${filePath}: ${error.message}`);
  }
}

/**
 * Check if a file exists at the given path
 * @async
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists, false otherwise
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  readJsonFile,
  fileExists,
};
