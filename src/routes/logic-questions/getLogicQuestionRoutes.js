/**
 * Get Logic Question Routes
 * @module routes/logic-questions/getLogicQuestionRoutes
 */

const express = require('express');
const {
  getLogicQuestionController,
} = require('../../controllers/logic-questions/getLogicQuestionController');

const router = express.Router();

router.get('/:id', getLogicQuestionController);

module.exports = router;
