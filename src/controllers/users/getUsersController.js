/**
 * Get Users Controller
 * @module controllers/users/getUsersController
 */

const userService = require('../../services/userService');
const logger = require('../../utils/logger');

/**
 * Format pagination data for response
 * @param {Object} pagination - Original pagination object
 * @returns {Object} - Formatted pagination object
 */
const formatPagination = pagination => {
  if (!pagination) return null;

  return {
    total: pagination.total,
    page: pagination.page,
    page_size: pagination.limit,
    total_pages: pagination.pages,
  };
};

/**
 * Get all users with pagination
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} - JSON response
 */
const getUsersController = async (req, res) => {
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
      result.pagination = formatPagination(result.pagination);
    }

    return res.status(200).json({
      status: 'success',
      message: 'Users retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error('Error in getUsersController:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      data: {},
    });
  }
};

module.exports = {
  getUsersController,
};
