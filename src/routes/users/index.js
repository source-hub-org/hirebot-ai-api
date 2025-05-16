/**
 * User Routes Index
 * @module routes/users
 */

const express = require('express');
const router = express.Router();
const userRoutes = require('./userRoutes');

// Mount user routes
router.use('/', userRoutes);

module.exports = router;
