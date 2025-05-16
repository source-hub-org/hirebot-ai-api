const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initializeDb } = require('./repository/baseRepository');
const { initializeRedis } = require('./service/redisService');
const { startJobProcessor } = require('./service/jobProcessorService');
const { initializeOAuthClients } = require('./services/oauthClientService');
const {
  healthCheckRoutes,
  candidateRoutes,
  submissionRoutes,
  questionRoutes,
  topicRoutes,
  positionRoutes,
  languageRoutes,
  instrumentTagRoutes,
  instrumentRoutes,
  logicTagRoutes,
  logicQuestionRoutes,
  oauthRoutes,
} = require('./routes');
const { swaggerDocs } = require('./config/swagger');
const { ensureDirectoriesExist } = require('./utils/ensureDirectories');
const logger = require('./utils/logger');

// Load environment variables
// Use .env.testing for test environments, otherwise use .env
if (process.env.NODE_ENV === 'testing') {
  const path = require('path');
  const envPath = path.resolve(process.cwd(), '.env.testing');
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env.testing file:', result.error);
  } else {
    console.log('Loaded environment from .env.testing');
  }
} else {
  dotenv.config();
  console.log('Loaded environment from .env');
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'hirebot_db';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const JOB_POLLING_INTERVAL = process.env.JOB_POLLING_INTERVAL || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import auth middleware
const { verifyAccessToken } = require('./middlewares/authMiddleware');

// Public routes (no authentication required)
app.use('/api/health-check', healthCheckRoutes);
app.use('/api/oauth', oauthRoutes);

// Protected routes (authentication required)
// Apply the verifyAccessToken middleware to all protected routes
app.use('/api/questions', verifyAccessToken, questionRoutes);
app.use('/api/topics', verifyAccessToken, topicRoutes);
app.use('/api/candidates', verifyAccessToken, candidateRoutes);
app.use('/api/submissions', verifyAccessToken, submissionRoutes);
app.use('/api/positions', verifyAccessToken, positionRoutes);
app.use('/api/languages', verifyAccessToken, languageRoutes);
app.use('/api/instrument-tags', verifyAccessToken, instrumentTagRoutes);
app.use('/api/instruments', verifyAccessToken, instrumentRoutes);
app.use('/api/logic-tags', verifyAccessToken, logicTagRoutes);
app.use('/api/logic-questions', verifyAccessToken, logicQuestionRoutes);

// Initialize application
async function initializeApp() {
  try {
    // Ensure required directories exist
    await ensureDirectoriesExist();
    logger.info('Required directories have been verified');

    // Connect to MongoDB using both native driver and mongoose
    await initializeDb(MONGODB_URI, DB_NAME);
    await mongoose.connect(MONGODB_URI, { dbName: DB_NAME });
    logger.info('Mongoose connected to MongoDB');

    // Initialize Redis
    await initializeRedis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    });
    logger.info('Redis initialized');

    // Initialize OAuth clients
    await initializeOAuthClients();
    logger.info('OAuth clients initialized');

    // Start the job processor
    startJobProcessor({
      pollingInterval: parseInt(JOB_POLLING_INTERVAL),
    }).catch(err => {
      logger.error('Error starting job processor:', err);
    });
    logger.info('Job processor started');

    // Initialize Swagger documentation
    swaggerDocs(app);

    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      await mongoose.disconnect();
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    return { app, server };
  } catch (error) {
    console.debug(error);
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Export for testing
module.exports = { app, initializeApp };
