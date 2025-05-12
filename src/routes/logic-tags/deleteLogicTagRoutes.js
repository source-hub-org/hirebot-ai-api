/**
 * Delete Logic Tag Routes
 * @module routes/logic-tags/deleteLogicTagRoutes
 */

const express = require('express');
const {
  deleteLogicTagController,
} = require('../../controllers/logic-tags/deleteLogicTagController');

const router = express.Router();

router.delete('/:id', deleteLogicTagController);

module.exports = router;
