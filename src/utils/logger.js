/**
 * Logger Utility
 * @module utils/logger
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Log levels
 * @enum {string}
 */
const LogLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

/**
 * Format a log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data to log
 * @returns {string} Formatted log message
 */
function formatLogMessage(level, message, data) {
  const timestamp = new Date().toISOString();
  const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
  return `[${timestamp}] [${level}] ${message}${dataString}`;
}

/**
 * Log an info message
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data to log
 */
function info(message, data) {
  console.log(formatLogMessage(LogLevel.INFO, message, data));
}

/**
 * Log a warning message
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data to log
 */
function warn(message, data) {
  console.warn(formatLogMessage(LogLevel.WARN, message, data));
}

/**
 * Log an error message
 * @param {string} message - Log message
 * @param {Error|Object} [error] - Optional error to log
 */
function error(message, error) {
  console.error(formatLogMessage(LogLevel.ERROR, message, error));
}

/**
 * Log a debug message (only in development)
 * @param {string} message - Log message
 * @param {Object} [data] - Optional data to log
 */
function debug(message, data) {
  if (process.env.NODE_ENV === 'development') {
    console.debug(formatLogMessage(LogLevel.DEBUG, message, data));
  }
}

/**
 * Write a log message to a file
 * @param {string} filename - Name of the log file
 * @param {string} message - Message to log
 * @param {Object} [data] - Optional data to log
 * @returns {Promise<void>}
 */
async function logToFile(filename, message, data) {
  try {
    const logDir = path.resolve(process.cwd(), 'logs');
    
    // Ensure the logs directory exists
    try {
      await fs.access(logDir);
    } catch (error) {
      await fs.mkdir(logDir, { recursive: true });
    }
    
    const logPath = path.join(logDir, filename);
    const timestamp = new Date().toISOString();
    const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    const logEntry = `[${timestamp}] ${message}${dataString}\n\n`;
    
    // Append to the log file
    await fs.appendFile(logPath, logEntry, 'utf8');
  } catch (err) {
    console.error(`Failed to write to log file ${filename}:`, err);
  }
}

module.exports = {
  LogLevel,
  info,
  warn,
  error,
  debug,
  logToFile,
};
