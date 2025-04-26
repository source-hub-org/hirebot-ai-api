/**
 * Routes Index
 * @module routes
 */

const healthCheckRoutes = require('./health-check');
const candidateRoutes = require('./candidates');
const submissionRoutes = require('./submissions');

module.exports = {
  healthCheckRoutes,
  candidateRoutes,
  submissionRoutes,
};
