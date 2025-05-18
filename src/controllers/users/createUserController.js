/**
 * Create User Controller
 * @module controllers/users/createUserController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');
const { findOrCreateCandidateForUser } = require('../../utils/userCandidateUtils');

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
      return res.status(400).json({
        status: 'error',
        message: validation.error,
        data: {},
      });
    }

    // Create the user
    let user = await userService.createUser({ email, username, password });

    try {
      // Find or create a candidate for this user and link them
      user = await findOrCreateCandidateForUser(user);

      return res.status(201).json({
        status: 'success',
        message: 'User created successfully and linked to candidate',
        data: user,
      });
    } catch (candidateError) {
      // If there's an error with candidate linking, log it but still return success for user creation
      logger.error('Error linking user to candidate:', candidateError);

      return res.status(201).json({
        status: 'success',
        message: 'User created successfully, but candidate linking failed',
        data: user,
      });
    }
  } catch (error) {
    logger.error('Error in createUserController:', error);

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
  createUserController,
};
