/**
 * OAuth Routes Index
 * @module routes/oauth
 */

const express = require('express');
const router = express.Router();
const tokenRoutes = require('./tokenRoutes');
const authorizeRoutes = require('./authorizeRoutes');
const clientRoutes = require('./clientRoutes');

/**
 * @swagger
 * tags:
 *   name: OAuth
 *   description: OAuth 2.0 authentication endpoints
 */

// Mount the OAuth routes
router.use('/token', tokenRoutes);
router.use('/authorize', authorizeRoutes);
router.use('/clients', clientRoutes);

module.exports = router;
