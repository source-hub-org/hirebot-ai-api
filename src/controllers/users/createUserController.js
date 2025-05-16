/**
 * Create User Controller
 * @module controllers/users/createUserController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Validate user input for creation
 * @param {Object} userData - User data to validate
 * @returns {Object} - Validation result with isValid and error
 */
const validateUserInput = userData => {
  const { email, username, password } = userData;

  if (!email || !username || !password) {
    return {
      isValid: false,
      error: 'Email, username, and password are required',
    };
  }

  return { isValid: true };
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const createUserController = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate required fields
    const validation = validateUserInput({ email, username, password });
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    const user = await userService.createUser({ email, username, password });

    return res.status(201).json(user);
  } catch (error) {
    logger.error('Error in createUserController:', error);

    // Handle specific errors
    if (
      error.message.includes('already in use') ||
      error.message.includes('Invalid email') ||
      error.message.includes('Password must be')
    ) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createUserController,
};
