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
const languageRoutes = require('./languages');
const instrumentTagRoutes = require('./instrument-tags');
const instrumentRoutes = require('./instruments');

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

/**
 * Creates a router for language routes
 * @returns {Object} Express router for language routes
 */
const createLanguageRouter = () => {
  const router = express.Router();
  router.use('/', languageRoutes);
  return router;
};

/**
 * Creates a router for instrument tag routes
 * @returns {Object} Express router for instrument tag routes
 */
const createInstrumentTagRouter = () => {
  const router = express.Router();
  router.use('/', instrumentTagRoutes);
  return router;
};

/**
 * Creates a router for instrument routes
 * @returns {Object} Express router for instrument routes
 */
const createInstrumentRouter = () => {
  const router = express.Router();
  router.use('/', instrumentRoutes);
  return router;
};

module.exports = {
  healthCheckRoutes,
  candidateRoutes,
  submissionRoutes,
  questionRoutes: createQuestionRouter(),
  topicRoutes: createTopicRouter(),
  positionRoutes: createPositionRouter(),
  languageRoutes: createLanguageRouter(),
  instrumentTagRoutes: createInstrumentTagRouter(),
  instrumentRoutes: createInstrumentRouter(),
};
