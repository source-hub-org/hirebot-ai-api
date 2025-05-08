/**
 * Instruments Routes Index
 * @module routes/instruments
 */

const express = require('express');
const createInstrumentRoutes = require('./createInstrumentRoutes');
const getAllInstrumentsRoutes = require('./getAllInstrumentsRoutes');
const getInstrumentRoutes = require('./getInstrumentRoutes');
const getInstrumentsByTagRoutes = require('./getInstrumentsByTagRoutes');
const updateInstrumentRoutes = require('./updateInstrumentRoutes');
const deleteInstrumentRoutes = require('./deleteInstrumentRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Instruments
 *   description: API endpoints for managing instruments (assessment questions)
 */

// Mount the individual route modules
router.use(createInstrumentRoutes);
router.use(getAllInstrumentsRoutes);
router.use(getInstrumentRoutes);
router.use(getInstrumentsByTagRoutes);
router.use(updateInstrumentRoutes);
router.use(deleteInstrumentRoutes);

module.exports = router;
