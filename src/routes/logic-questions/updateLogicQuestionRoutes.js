/**
 * Update Logic Question Routes
 * @module routes/logic-questions/updateLogicQuestionRoutes
 */

const express = require('express');
const {
  updateLogicQuestionController,
} = require('../../controllers/logic-questions/updateLogicQuestionController');

const router = express.Router();

router.put('/:id', updateLogicQuestionController);

module.exports = router;
