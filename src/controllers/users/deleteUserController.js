/**
 * Delete User Controller
 * @module controllers/users/deleteUserController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Delete a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        data: {},
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    logger.error(`Error in deleteUserController for ID ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      data: {}
    });
  }
};

module.exports = {
  deleteUserController,
};
