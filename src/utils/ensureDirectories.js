/**
 * Utility to ensure required directories exist
 * @module utils/ensureDirectories
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('./logger');

/**
 * Ensures that required application directories exist
 * @returns {Promise<void>}
 */
async function ensureDirectoriesExist() {
  const directories = [
    path.resolve(process.cwd(), 'logs'),
    path.resolve(process.cwd(), 'data'),
    path.resolve(process.cwd(), 'tmp'),
  ];

  for (const dir of directories) {
    try {
      await fs.access(dir);
      logger.info(`Directory exists: ${dir}`);
    } catch (error) {
      try {
        await fs.mkdir(dir, { recursive: true });
        logger.info(`Created directory: ${dir}`);
      } catch (mkdirError) {
        logger.error(`Failed to create directory ${dir}:`, mkdirError);
      }
    }
  }
}

module.exports = {
  ensureDirectoriesExist,
};
