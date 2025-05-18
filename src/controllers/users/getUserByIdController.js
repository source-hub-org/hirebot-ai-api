/**
 * Get User By ID Controller
 * @module controllers/users/getUserByIdController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Get a user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        data: {},
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User retrieved successfully',
      data: user,
    });
  } catch (error) {
    logger.error(`Error in getUserByIdController for ID ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      data: {},
    });
  }
};

module.exports = {
  getUserByIdController,
};
