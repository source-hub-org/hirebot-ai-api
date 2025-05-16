/**
 * Current User Controller
 * @module controllers/users/getCurrentUserController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Get the currently authenticated user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with user data
 */
const getCurrentUser = async (req, res) => {
  try {
    // The user ID is already extracted from the token in the auth middleware
    const userId = req.user.id;

    if (!userId) {
      logger.error('User ID not found in token payload');
      return res.status(401).json({
        error: 'unauthorized',
        error_description: 'Invalid user information in token',
      });
    }

    // Retrieve user data using the existing service
    const user = await userService.getUserById(userId);

    if (!user) {
      logger.error(`User not found for ID ${userId} from token`);
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error('Error in getCurrentUser controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getCurrentUser,
};
