/**
 * Topic Routes Index
 * @module routes/topics
 */

const express = require('express');
const getAllTopicsRoutes = require('./getAllTopicsRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Topics
 *   description: API endpoints for managing topics
 */

// Mount the individual route modules
router.use(getAllTopicsRoutes);

module.exports = router;
