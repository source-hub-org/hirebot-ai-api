/**
 * Logic Questions Routes Index
 * @module routes/logic-questions
 */

const express = require('express');
const createLogicQuestionRoutes = require('./createLogicQuestionRoutes');
const getAllLogicQuestionsRoutes = require('./getAllLogicQuestionsRoutes');
const getLogicQuestionRoutes = require('./getLogicQuestionRoutes');
const updateLogicQuestionRoutes = require('./updateLogicQuestionRoutes');
const deleteLogicQuestionRoutes = require('./deleteLogicQuestionRoutes');

const router = express.Router();

// Mount the individual route modules
router.use(createLogicQuestionRoutes);
router.use(getAllLogicQuestionsRoutes);
router.use(getLogicQuestionRoutes);
router.use(updateLogicQuestionRoutes);
router.use(deleteLogicQuestionRoutes);

module.exports = router;
