/**
 * Instrument Tags Routes Index
 * @module routes/instrument-tags
 */

const express = require('express');
const createInstrumentTagRoutes = require('./createInstrumentTagRoutes');
const getAllInstrumentTagsRoutes = require('./getAllInstrumentTagsRoutes');
const getInstrumentTagRoutes = require('./getInstrumentTagRoutes');
const updateInstrumentTagRoutes = require('./updateInstrumentTagRoutes');
const deleteInstrumentTagRoutes = require('./deleteInstrumentTagRoutes');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Instrument Tags
 *   description: API endpoints for managing instrument tags
 */

// Mount the individual route modules
router.use(createInstrumentTagRoutes);
router.use(getAllInstrumentTagsRoutes);
router.use(getInstrumentTagRoutes);
router.use(updateInstrumentTagRoutes);
router.use(deleteInstrumentTagRoutes);

module.exports = router;
