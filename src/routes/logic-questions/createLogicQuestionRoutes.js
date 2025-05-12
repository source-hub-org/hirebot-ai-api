/**
 * Create Logic Question Routes
 * @module routes/logic-questions/createLogicQuestionRoutes
 */

const express = require('express');
const {
  createLogicQuestionController,
} = require('../../controllers/logic-questions/createLogicQuestionController');

const router = express.Router();

router.post('/', createLogicQuestionController);

module.exports = router;
