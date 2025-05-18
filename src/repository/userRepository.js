/**
 * User Repository
 * @module repository/userRepository
 */

const User = require('../models/userModel');
const logger = require('../utils/logger');

/**
 * Find a user by ID
 * @param {string} id - The user ID
 * @param {boolean} includePassword - Whether to include the password field
 * @returns {Promise<Object|null>} - The found user or null
 */
const findById = async (id, includePassword = false) => {
  try {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findById(id, projection).populate('candidate_id').exec();
  } catch (error) {
    logger.error(`Error finding user by ID ${id}:`, error);
    throw error;
  }
};

/**
 * Find a user by email
 * @param {string} email - The email to find
 * @param {boolean} includePassword - Whether to include the password field
 * @returns {Promise<Object|null>} - The found user or null
 */
const findByEmail = async (email, includePassword = false) => {
  try {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ email: email.toLowerCase() }, projection)
      .populate('candidate_id')
      .exec();
  } catch (error) {
    logger.error(`Error finding user by email ${email}:`, error);
    throw error;
  }
};

/**
 * Find a user by username
 * @param {string} username - The username to find
 * @param {boolean} includePassword - Whether to include the password field
 * @returns {Promise<Object|null>} - The found user or null
 */
const findByUsername = async (username, includePassword = false) => {
  try {
    const projection = includePassword ? {} : { password: 0 };
    return await User.findOne({ username }, projection).populate('candidate_id').exec();
  } catch (error) {
    logger.error(`Error finding user by username ${username}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @returns {Promise<Object>} - The created user
 */
const create = async userData => {
  try {
    const user = new User(userData);
    return await user.save();
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param {string} id - The user ID
 * @param {Object} userData - The user data to update
 * @returns {Promise<Object|null>} - The updated user or null
 */
const update = async (id, userData) => {
  try {
    // If updating password, it will be hashed by the pre-save hook
    const user = await User.findById(id);
    if (!user) return null;

    Object.keys(userData).forEach(key => {
      user[key] = userData[key];
    });

    return await user.save();
  } catch (error) {
    logger.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} id - The user ID
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
const remove = async id => {
  try {
    const result = await User.deleteOne({ _id: id });
    return result.deletedCount > 0;
  } catch (error) {
    logger.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

/**
 * List users with pagination, filtering and sorting
 * @param {Object} filters - The filters to apply
 * @param {Object} pagination - The pagination options
 * @param {number} pagination.page - The page number (1-based)
 * @param {number} pagination.limit - The number of items per page
 * @param {Object} sort - The sort options
 * @param {string} sort.field - The field to sort by (createdAt, email, username)
 * @param {string} sort.direction - The sort direction (asc, desc)
 * @returns {Promise<Object>} - The paginated users
 */
const list = async (
  filters = {},
  pagination = { page: 1, limit: 20 },
  sort = { field: 'createdAt', direction: 'desc' }
) => {
  try {
    const { page = 1, limit = 20 } = pagination;
    const { field = 'createdAt', direction = 'desc' } = sort;
    const skip = (page - 1) * limit;

    const query = {};
    if (filters.username) query.username = { $regex: filters.username, $options: 'i' };
    if (filters.email) query.email = { $regex: filters.email, $options: 'i' };

    // Create sort object for MongoDB
    const sortDirection = direction === 'asc' ? 1 : -1;
    const sortObj = {};
    sortObj[field] = sortDirection;

    const [users, total] = await Promise.all([
      User.find(query, { password: 0 })
        .populate('candidate_id')
        .skip(skip)
        .limit(limit)
        .sort(sortObj)
        .exec(),
      User.countDocuments(query),
    ]);

    return {
      data: users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error listing users:', error);
    throw error;
  }
};

module.exports = {
  findById,
  findByEmail,
  findByUsername,
  create,
  update,
  remove,
  list,
};
