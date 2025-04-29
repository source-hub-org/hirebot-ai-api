/**
 * Routes Index
 * @module routes
 */

const express = require('express');
const healthCheckRoutes = require('./health-check');
const candidateRoutes = require('./candidates');
const submissionRoutes = require('./submissions');
const questionRoutes = require('./questions');
const topicRoutes = require('./topics');
const positionRoutes = require('./positions');

/**
 * Creates a router for question routes
 * @returns {Object} Express router for question routes
 */
const createQuestionRouter = () => {
  const router = express.Router();
  router.use('/', questionRoutes);
  return router;
};

/**
 * Creates a router for topic routes
 * @returns {Object} Express router for topic routes
 */
const createTopicRouter = () => {
  const router = express.Router();
  router.use('/', topicRoutes);
  return router;
};

/**
 * Creates a router for position routes
 * @returns {Object} Express router for position routes
 */
const createPositionRouter = () => {
  const router = express.Router();
  router.use('/', positionRoutes);
  return router;
};

module.exports = {
  healthCheckRoutes,
  candidateRoutes,
  submissionRoutes,
  questionRoutes: createQuestionRouter(),
  topicRoutes: createTopicRouter(),
  positionRoutes: createPositionRouter(),
};
