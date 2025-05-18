/**
 * Update User Controller
 * @module controllers/users/updateUserController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Prepare user data for update
 * @param {Object} requestBody - Request body containing fields to update
 * @returns {Object} - Object with userData and validation result
 */
const prepareUserData = requestBody => {
  const { email, username, password } = requestBody;

  // Ensure at least one field to update
  if (!email && !username && !password) {
    return {
      isValid: false,
      error: 'At least one field to update is required',
    };
  }

  const userData = {};
  if (email) userData.email = email;
  if (username) userData.username = username;
  if (password) userData.password = password;

  return {
    isValid: true,
    userData,
  };
};

/**
 * Update a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const updateUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Prepare and validate user data
    const { isValid, error, userData } = prepareUserData(req.body);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: error,
        data: {},
      });
    }

    const user = await userService.updateUser(id, userData);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        data: {},
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    logger.error(`Error in updateUserController for ID ${req.params.id}:`, error);

    // Handle specific errors
    if (
      error.message.includes('already in use') ||
      error.message.includes('Invalid email') ||
      error.message.includes('Password must be')
    ) {
      return res.status(400).json({
        status: 'error',
        message: error.message,
        data: {},
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      data: {},
    });
  }
};

module.exports = {
  updateUserController,
};
