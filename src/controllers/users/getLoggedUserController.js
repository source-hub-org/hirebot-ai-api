/**
 * Logged User Controller
 * @module controllers/users/getLoggedUserController
 *
 * This controller handles retrieving the currently logged in user's profile
 * using the req.loggedUser object set by the compatAuthMiddleware.
 *
 * The route returns user information in the following format:
 * {
 *   "_id": "60d21b4667d0d8992e610c85",
 *   "username": "johndoe",
 *   "email": "john.doe@example.com",
 *   "createdAt": "2025-05-16T10:23:20.335Z",
 *   "updatedAt": "2025-05-16T10:23:20.335Z"
 * }
 */

const logger = require('../../utils/logger');

/**
 * Validates if the user object contains required fields
 * @param {Object} user - User object to validate
 * @returns {Boolean} - True if user has required fields, false otherwise
 */
const isValidUserObject = user => {
  return user && user._id && user.username && user.email;
};

/**
 * Formats the user object to return only necessary fields
 * @param {Object} user - User object to format
 * @returns {Object} - Formatted user object with _id, username, email, createdAt, and updatedAt
 */
const formatUserResponse = user => {
  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt || new Date().toISOString(),
    updatedAt: user.updatedAt || new Date().toISOString(),
  };
};

/**
 * Get the currently logged-in user's profile from req.loggedUser
 *
 * This endpoint checks for the presence of req.loggedUser and returns the user data
 * if it exists and contains valid information. If req.loggedUser is not found or
 * does not contain valid user data, it responds with HTTP status code 404.
 *
 * @param {Object} req - Express request object containing req.loggedUser
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response with user data or error message
 */
const getLoggedUser = async (req, res) => {
  try {
    // Check if loggedUser exists in the request
    if (!req.loggedUser) {
      logger.error('No logged user found in request');
      return res.status(404).json({
        status: 'error',
        message: 'User not found',
        data: {},
      });
    }

    // Validate the user object has required fields
    if (!isValidUserObject(req.loggedUser)) {
      logger.error('Invalid user object in req.loggedUser');
      return res.status(404).json({
        status: 'error',
        message: 'Invalid user data',
        data: {},
      });
    }

    // Format and return the user data
    const formattedUser = formatUserResponse(req.loggedUser);
    return res.status(200).json({
      status: 'success',
      message: 'User profile retrieved successfully',
      data: formattedUser,
    });
  } catch (error) {
    logger.error('Error in getLoggedUser controller:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      data: {},
    });
  }
};

module.exports = {
  getLoggedUser,
};
