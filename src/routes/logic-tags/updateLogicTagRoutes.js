/**
 * Update Logic Tag Routes
 * @module routes/logic-tags/updateLogicTagRoutes
 */

const express = require('express');
const {
  updateLogicTagController,
} = require('../../controllers/logic-tags/updateLogicTagController');

const router = express.Router();

router.put('/:id', updateLogicTagController);

module.exports = router;
