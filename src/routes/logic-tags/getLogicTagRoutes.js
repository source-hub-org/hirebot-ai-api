/**
 * Get Logic Tag Routes
 * @module routes/logic-tags/getLogicTagRoutes
 */

const express = require('express');
const { getLogicTagController } = require('../../controllers/logic-tags/getLogicTagController');

const router = express.Router();

router.get('/:id', getLogicTagController);

module.exports = router;
