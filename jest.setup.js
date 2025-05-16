// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');
const { closeConnection } = require('./src/repository/baseRepository');
const { closeRedisConnection } = require('./src/services/redisService');

// Load environment variables from .env.testing file
beforeAll(() => {
  // Use absolute path to ensure the file is found
  const envPath = path.resolve(process.cwd(), '.env.testing');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('Error loading .env.testing file:', result.error);
  } else {
    console.log('.env.testing file loaded successfully');
    console.log('DB_NAME:', process.env.DB_NAME);
  }
});

// Close all connections after all tests are done
afterAll(async () => {
  try {
    // Close MongoDB connections
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }

    await closeConnection();

    // Close Redis connection
    await closeRedisConnection();

    // Add a small delay to ensure all connections are properly closed
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('All database and Redis connections closed');
  } catch (error) {
    console.error('Error closing connections:', error);
  }
}, 5000); // Increase timeout to 5 seconds
