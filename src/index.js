const express = require('express');
const dotenv = require('dotenv');
const { initializeDb } = require('./repository/baseRepository');
const healthCheckRoutes = require('./routes/healthCheckRoutes');
const questionRoutes = require('./routes/questionRoutes');
const topicRoutes = require('./routes/topicRoutes');
const { swaggerDocs } = require('./config/swagger');
const { ensureDirectoriesExist } = require('./utils/ensureDirectories');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hirebot_db';

// Middleware
app.use(express.json());

// Routes
app.use('/api/health-check', healthCheckRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/topics', topicRoutes);

// Initialize MongoDB connection
async function initializeApp() {
  try {
    // Ensure required directories exist
    await ensureDirectoriesExist();
    logger.info('Required directories have been verified');

    // Connect to MongoDB
    await initializeDb(MONGODB_URI, DB_NAME);

    // Initialize Swagger documentation
    swaggerDocs(app);

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    return { app, server };
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// If this file is run directly, initialize the app
if (require.main === module) {
  initializeApp();
}

// Export for testing
module.exports = { app, initializeApp };
