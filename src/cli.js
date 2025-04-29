#!/usr/bin/env node

/**
 * Command Line Interface for Hirebot API
 * @module cli
 */

const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { executeCommand } = require('./commands');
const { initializeDb } = require('./repository/baseRepository');
const logger = require('./utils/logger');

// Load environment variables
// Use .env.testing for test environments, otherwise use .env
if (process.env.NODE_ENV === 'testing') {
  dotenv.config({ path: '.env.testing' });
} else {
  dotenv.config();
}

// MongoDB connection details
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hirebot_db';

/**
 * Main CLI function
 */
async function main() {
  try {
    // Get command and arguments from the command line
    const [, , commandName, ...args] = process.argv;

    if (!commandName) {
      console.error('Error: Command name is required');
      console.log('Usage: node cli.js <command-name> [args...]');
      process.exit(1);
    }

    // Initialize database connection
    await initializeDb(MONGODB_URI, DB_NAME);
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    logger.info('Connected to MongoDB');
    logger.info(`Connected to database: ${DB_NAME}`);

    // Execute the command
    await executeCommand(commandName, args);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');

    // Exit successfully
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);

    // Ensure we disconnect from MongoDB even on error
    try {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    } catch (disconnectError) {
      logger.error('Error disconnecting from MongoDB:', disconnectError);
    }

    process.exit(1);
  }
}

// Run the CLI
main();
