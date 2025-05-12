/**
 * Create Logic Tag Routes
 * @module routes/logic-tags/createLogicTagRoutes
 */

const express = require('express');
const {
  createLogicTagController,
} = require('../../controllers/logic-tags/createLogicTagController');

const router = express.Router();

router.post('/', createLogicTagController);

module.exports = router;
