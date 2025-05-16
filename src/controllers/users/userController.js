/**
 * User Controller
 * @module controllers/users/userController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      page_size = 20,
      username,
      email,
      sort_by = 'createdAt',
      sort_direction = 'desc',
    } = req.query;

    const filters = {};
    if (username) filters.username = username;
    if (email) filters.email = email;

    const pagination = {
      page: parseInt(page, 10),
      limit: parseInt(page_size, 10),
    };

    const sort = {
      field: ['createdAt', 'email', 'username'].includes(sort_by) ? sort_by : 'createdAt',
      direction: sort_direction === 'asc' ? 'asc' : 'desc',
    };

    const result = await userService.listUsers(filters, pagination, sort);

    // Transform the pagination format in the response
    if (result.pagination) {
      result.pagination = {
        total: result.pagination.total,
        page: result.pagination.page,
        page_size: result.pagination.limit,
        total_pages: result.pagination.pages,
      };
    }

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Error in getUsers controller:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a user by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error(`Error in getUserById controller for ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const createUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    const user = await userService.createUser({ email, username, password });

    return res.status(201).json(user);
  } catch (error) {
    logger.error('Error in createUser controller:', error);

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

/**
 * Update a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, username, password } = req.body;

    // Ensure at least one field to update
    if (!email && !username && !password) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }

    const userData = {};
    if (email) userData.email = email;
    if (username) userData.username = username;
    if (password) userData.password = password;

    const user = await userService.updateUser(id, userData);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    logger.error(`Error in updateUser controller for ID ${req.params.id}:`, error);

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

/**
 * Delete a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await userService.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(204).send();
  } catch (error) {
    logger.error(`Error in deleteUser controller for ID ${req.params.id}:`, error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
