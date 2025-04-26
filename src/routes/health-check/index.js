/**
 * Health Check Routes Index
 * @module routes/health-check
 */

const express = require('express');
const router = express.Router();
const basicHealthRoutes = require('./basicHealthRoutes');
const databaseHealthRoutes = require('./databaseHealthRoutes');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health check endpoints
 */

// Mount the health check routes
router.use('/', basicHealthRoutes);
router.use('/', databaseHealthRoutes);

module.exports = router;
