/**
 * Topic Commands Module
 * @module commands/topicCommands
 */

const { readJsonFile, fileExists } = require('../utils/fileParser');
const { validateTopicsData } = require('../utils/topicValidator');
const { clearAllTopics, insertTopics } = require('../repository/topicRepository');
const logger = require('../utils/logger');

/**
 * Initialize topics from a JSON file
 * @async
 * @param {Array<string>} args - Command arguments (first argument should be the file path)
 * @returns {Promise<void>}
 * @throws {Error} If file validation or database operations fail
 */
async function initTopicsCommand(args) {
  if (!args || args.length === 0) {
    throw new Error('File path argument is required');
  }

  const filePath = args[0];
  logger.info(`Initializing topics from file: ${filePath}`);

  // Check if file exists
  const exists = await fileExists(filePath);
  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }

  try {
    // Read and parse the JSON file
    const data = await readJsonFile(filePath);

    // Validate the data structure
    const validation = validateTopicsData(data);
    if (!validation.isValid) {
      throw new Error(`Invalid topics data: ${validation.errors.join(', ')}`);
    }

    // Clear existing topics
    await clearAllTopics();
    logger.info('Existing topics cleared successfully');

    // Insert new topics
    const result = await insertTopics(data.topics);
    logger.info(`Successfully inserted ${result.insertedCount} topics`);

    return {
      success: true,
      message: `Successfully initialized ${result.insertedCount} topics`,
    };
  } catch (error) {
    logger.error('Failed to initialize topics:', error);
    throw error;
  }
}

module.exports = {
  initTopicsCommand,
};
