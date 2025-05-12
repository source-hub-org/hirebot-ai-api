/**
 * Get All Logic Questions Routes
 * @module routes/logic-questions/getAllLogicQuestionsRoutes
 */

const express = require('express');
const {
  getAllLogicQuestionsController,
} = require('../../controllers/logic-questions/getAllLogicQuestionsController');

const router = express.Router();

router.get('/', getAllLogicQuestionsController);

module.exports = router;
