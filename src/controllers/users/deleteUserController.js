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
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(204).send();
  } catch (error) {
    logger.error(`Error in deleteUserController for ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  deleteUserController,
};
