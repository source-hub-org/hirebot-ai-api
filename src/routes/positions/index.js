/**
 * Positions Routes Index
 * @module routes/positions
 */

const express = require('express');
const getAllPositionsRoutes = require('./getAllPositionsRoutes');
const getPositionByIdRoutes = require('./getPositionByIdRoutes');
const createPositionRoutes = require('./createPositionRoutes');
const updatePositionRoutes = require('./updatePositionRoutes');
const deletePositionRoutes = require('./deletePositionRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Positions
 *   description: API endpoints for managing positions
 */

// Mount the individual route modules
router.use(getAllPositionsRoutes);
router.use(getPositionByIdRoutes);
router.use(createPositionRoutes);
router.use(updatePositionRoutes);
router.use(deletePositionRoutes);

module.exports = router;