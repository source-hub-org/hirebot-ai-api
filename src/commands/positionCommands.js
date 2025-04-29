/**
 * Position Commands Module
 * @module commands/positionCommands
 */

const { readJsonFile, fileExists } = require('../utils/fileParser');
const { validatePositionsData } = require('../utils/positionValidator');
const {
  clearAllPositions,
  insertPositions,
  getPositionBySlug,
} = require('../repository/positionRepository');
const logger = require('../utils/logger');

/**
 * Initialize positions from a JSON file
 * @async
 * @param {Array<string>} args - Command arguments (first argument should be the file path)
 * @returns {Promise<Object>} Result of the operation
 * @throws {Error} If file validation or database operations fail
 */
async function initPositionsCommand(args) {
  if (!args || args.length === 0) {
    throw new Error('File path argument is required');
  }

  const filePath = args[0];
  logger.info(`Initializing positions from file: ${filePath}`);

  // Check if file exists
  const exists = await fileExists(filePath);
  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Read and parse the JSON file
    const data = await readJsonFile(filePath);

    // Validate the data structure
    const validation = validatePositionsData(data);
    if (!validation.isValid) {
      throw new Error(`Invalid positions data: ${validation.errors.join(', ')}`);
    }

    // Determine if we have a direct array or an object with positions array
    const positions = Array.isArray(data) ? data : data.positions;

    // Check for duplicate slugs within the file
    const slugs = new Set();
    const duplicateSlugs = [];

    positions.forEach(position => {
      if (slugs.has(position.slug)) {
        duplicateSlugs.push(position.slug);
      }
      slugs.add(position.slug);
    });

    if (duplicateSlugs.length > 0) {
      throw new Error(`Duplicate slugs found in file: ${duplicateSlugs.join(', ')}`);
    }

    // Clear existing positions
    await clearAllPositions();
    logger.info('Existing positions cleared successfully');

    // Check for existing positions in the database and handle accordingly
    const positionsToInsert = [];

    for (const position of positions) {
      // Map level to positionLevel if needed
      if (position.level && !position.positionLevel) {
        position.positionLevel = position.level;
      }

      // Add timestamps
      position.createdAt = new Date();
      position.updatedAt = new Date();

      positionsToInsert.push(position);
    }

    // Insert new positions
    const result = await insertPositions(positionsToInsert);
    logger.info(`Successfully inserted ${result.insertedCount} positions`);

    return {
      success: true,
      message: `Successfully initialized ${result.insertedCount} positions`,
    };
  } catch (error) {
    logger.error('Failed to initialize positions:', error);
    throw error;
  }
}

module.exports = {
  initPositionsCommand,
};
