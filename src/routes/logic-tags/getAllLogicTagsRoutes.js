/**
 * Get All Logic Tags Routes
 * @module routes/logic-tags/getAllLogicTagsRoutes
 */

const express = require('express');
const {
  getAllLogicTagsController,
} = require('../../controllers/logic-tags/getAllLogicTagsController');

const router = express.Router();

router.get('/', getAllLogicTagsController);

module.exports = router;
