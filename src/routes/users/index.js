/**
 * User Routes Index
 * @module routes/users
 */

const express = require('express');
const router = express.Router();
const currentUserRoutes = require('./currentUserRoutes');
const getUsersRoutes = require('./getUsersRoutes');
const getUserByIdRoutes = require('./getUserByIdRoutes');
const createUserRoutes = require('./createUserRoutes');
const updateUserRoutes = require('./updateUserRoutes');
const deleteUserRoutes = require('./deleteUserRoutes');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

// Mount current user routes first to ensure proper route matching
router.use(currentUserRoutes);

// Mount other user routes
router.use(getUsersRoutes);
router.use(getUserByIdRoutes);
router.use(createUserRoutes);
router.use(updateUserRoutes);
router.use(deleteUserRoutes);

module.exports = router;
