/**
 * Users Controllers Index
 * @module controllers/users
 */

const { getUsersController } = require('./getUsersController');
const { getUserByIdController } = require('./getUserByIdController');
const { createUserController } = require('./createUserController');
const { updateUserController } = require('./updateUserController');
const { deleteUserController } = require('./deleteUserController');
const { getLoggedUser } = require('./getLoggedUserController');

module.exports = {
  getUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  getLoggedUser,
};
