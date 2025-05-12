/**
 * Delete Logic Question Routes
 * @module routes/logic-questions/deleteLogicQuestionRoutes
 */

const express = require('express');
const {
  deleteLogicQuestionController,
} = require('../../controllers/logic-questions/deleteLogicQuestionController');

const router = express.Router();

router.delete('/:id', deleteLogicQuestionController);

module.exports = router;
