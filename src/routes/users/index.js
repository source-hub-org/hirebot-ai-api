/**
 * User Routes Index
 * @module routes/users
 */

const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');
const currentUserRoutes = require('./currentUserRoutes');

// Mount current user routes first to ensure proper route matching
router.use('/', currentUserRoutes);

// Mount other user routes
router.use('/', userRoutes);

module.exports = router;
