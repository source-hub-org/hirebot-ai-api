/**
 * Question Routes Index
 * @module routes/questions
 */

const express = require('express');
const generateRoutes = require('./generateRoutes');
const searchRoutes = require('./searchRoutes');
const requestRoutes = require('./requestRoutes');
const analyzeRoutes = require('./analyzeRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Questions
 *   description: API endpoints for generating and managing questions
 */

// Mount the individual route modules
router.use(generateRoutes);
router.use(searchRoutes);
router.use(requestRoutes);
router.use(analyzeRoutes);

module.exports = router;
