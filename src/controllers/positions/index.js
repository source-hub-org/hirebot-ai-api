/**
 * Positions Controllers Index
 * @module controllers/positions
 */

const { getAllPositionsController } = require('./getAllPositionsController');
const { getPositionByIdController } = require('./getPositionByIdController');
const { createPositionController } = require('./createPositionController');
const { updatePositionController } = require('./updatePositionController');
const { deletePositionController } = require('./deletePositionController');

module.exports = {
  getAllPositionsController,
  getPositionByIdController,
  createPositionController,
  updatePositionController,
  deletePositionController,
};