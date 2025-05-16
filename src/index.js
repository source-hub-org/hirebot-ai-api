const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { initializeDb } = require('./repository/baseRepository');
const { initializeRedis } = require('./services/redisService');
const { startJobProcessor } = require('./services/jobProcessorService');
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
  userRoutes,
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
let authMiddleware;
if (process.env.NODE_ENV === 'testing') {
  // Use mock middleware for tests
  authMiddleware = require('../test/mocks/oauthMiddleware');
} else {
  // Use compatibility middleware for production
  // This allows both old and new authentication methods to work
  authMiddleware = require('./middlewares/compatAuthMiddleware');
}

// Public routes (no authentication required)
app.use('/api/health-check', healthCheckRoutes);
app.use('/api/oauth', oauthRoutes);

// Public user registration route
const publicUserRoutes = require('./routes/users/publicUserRoutes');
app.use('/api/register', publicUserRoutes);

// Protected routes (authentication required)
// Apply the authentication middleware to all protected routes
const authMethod =
  process.env.NODE_ENV === 'testing'
    ? authMiddleware.authenticate
    : authMiddleware.compatAuthenticate;

app.use('/api/questions', authMethod(), questionRoutes);
app.use('/api/topics', authMethod(), topicRoutes);
app.use('/api/candidates', authMethod(), candidateRoutes);
app.use('/api/submissions', authMethod(), submissionRoutes);
app.use('/api/positions', authMethod(), positionRoutes);
app.use('/api/languages', authMethod(), languageRoutes);
app.use('/api/instrument-tags', authMethod(), instrumentTagRoutes);
app.use('/api/instruments', authMethod(), instrumentRoutes);
app.use('/api/logic-tags', authMethod(), logicTagRoutes);
app.use('/api/logic-questions', authMethod(), logicQuestionRoutes);
app.use('/api/users', authMethod(), userRoutes);

// Initialize application
async function initializeApp() {
  try {
    // Ensure required directories exist
    await ensureDirectoriesExist();
    logger.info('Required directories have been verified');

    // Connect to MongoDB using both the native driver and mongoose
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

    // Handle a graceful shutdown
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
