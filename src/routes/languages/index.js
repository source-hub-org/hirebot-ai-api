/**
 * Languages Routes Index
 * @module routes/languages
 */

const express = require('express');
const getAllLanguagesRoutes = require('./getAllLanguagesRoutes');
const getLanguageByIdRoutes = require('./getLanguageByIdRoutes');
const createLanguageRoutes = require('./createLanguageRoutes');
const updateLanguageRoutes = require('./updateLanguageRoutes');
const deleteLanguageRoutes = require('./deleteLanguageRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Languages
 *   description: API endpoints for managing programming languages
 */

// Mount the individual route modules
router.use(getAllLanguagesRoutes);
router.use(getLanguageByIdRoutes);
router.use(createLanguageRoutes);
router.use(updateLanguageRoutes);
router.use(deleteLanguageRoutes);

module.exports = router;
