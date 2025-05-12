/**
 * Logic Tags Routes Index
 * @module routes/logic-tags
 */

const express = require('express');
const createLogicTagRoutes = require('./createLogicTagRoutes');
const getAllLogicTagsRoutes = require('./getAllLogicTagsRoutes');
const getLogicTagRoutes = require('./getLogicTagRoutes');
const updateLogicTagRoutes = require('./updateLogicTagRoutes');
const deleteLogicTagRoutes = require('./deleteLogicTagRoutes');

const router = express.Router();

// Mount the individual route modules
router.use(createLogicTagRoutes);
router.use(getAllLogicTagsRoutes);
router.use(getLogicTagRoutes);
router.use(updateLogicTagRoutes);
router.use(deleteLogicTagRoutes);

module.exports = router;
