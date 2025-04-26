/**
 * Question Routes
 * @module routes/questionRoutes
 */

const express = require('express');
const questionRoutes = require('./questions');

const router = express.Router();

// Use the modular question routes
router.use('/', questionRoutes);

module.exports = router;
