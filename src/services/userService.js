/**
 * User Service
 * @module services/userService
 */

const userRepository = require('../repository/userRepository');
const logger = require('../utils/logger');

/**
 * Validate email format
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidEmail = email => {
  const emailRegex = /^\S+@\S+\.\S+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidPassword = password => {
  // Password must be at least 8 characters
  return password && password.length >= 8;
};

/**
 * Get a user by ID
 * @param {string} id - The user ID
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUserById = async id => {
  try {
    return await userRepository.findById(id);
  } catch (error) {
    logger.error(`Error in getUserById service for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get a user by email
 * @param {string} email - The email to find
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUserByEmail = async email => {
  try {
    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    return await userRepository.findByEmail(email);
  } catch (error) {
    logger.error(`Error in getUserByEmail service for email ${email}:`, error);
    throw error;
  }
};

/**
 * Get a user by username
 * @param {string} username - The username to find
 * @returns {Promise<Object|null>} - The found user or null
 */
const getUserByUsername = async username => {
  try {
    return await userRepository.findByUsername(username);
  } catch (error) {
    logger.error(`Error in getUserByUsername service for username ${username}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 * @param {Object} userData - The user data
 * @returns {Promise<Object>} - The created user
 */
const createUser = async userData => {
  try {
    // Validate email
    if (!isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password
    if (!isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists
    const existingEmail = await userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error('Email already in use');
    }

    // Check if username already exists
    const existingUsername = await userRepository.findByUsername(userData.username);
    if (existingUsername) {
      throw new Error('Username already in use');
    }

    // Create user
    const user = await userRepository.create(userData);

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    logger.error('Error in createUser service:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param {string} id - The user ID
 * @param {Object} userData - The user data to update
 * @returns {Promise<Object|null>} - The updated user or null
 */
const updateUser = async (id, userData) => {
  try {
    // Validate email if provided
    if (userData.email && !isValidEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate password if provided
    if (userData.password && !isValidPassword(userData.password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if email already exists (if changing email)
    if (userData.email) {
      const existingEmail = await userRepository.findByEmail(userData.email);
      if (existingEmail && existingEmail._id.toString() !== id) {
        throw new Error('Email already in use');
      }
    }

    // Check if username already exists (if changing username)
    if (userData.username) {
      const existingUsername = await userRepository.findByUsername(userData.username);
      if (existingUsername && existingUsername._id.toString() !== id) {
        throw new Error('Username already in use');
      }
    }

    // Update user
    const user = await userRepository.update(id, userData);
    if (!user) return null;

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    logger.error(`Error in updateUser service for ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a user
 * @param {string} id - The user ID
 * @returns {Promise<boolean>} - True if deleted, false otherwise
 */
const deleteUser = async id => {
  try {
    return await userRepository.remove(id);
  } catch (error) {
    logger.error(`Error in deleteUser service for ID ${id}:`, error);
    throw error;
  }
};

/**
 * List users with pagination, filtering and sorting
 * @param {Object} filters - The filters to apply
 * @param {Object} pagination - The pagination options
 * @param {Object} sort - The sort options (field and direction)
 * @returns {Promise<Object>} - The paginated users
 */
const listUsers = async (filters = {}, pagination = {}, sort = {}) => {
  try {
    return await userRepository.list(filters, pagination, sort);
  } catch (error) {
    logger.error('Error in listUsers service:', error);
    throw error;
  }
};

/**
 * Validate user credentials
 * @param {string} usernameOrEmail - The username or email
 * @param {string} password - The password to validate
 * @returns {Promise<Object|null>} - The user if valid, null otherwise
 */
const validateUserCredentials = async (usernameOrEmail, password) => {
  try {
    // Determine if input is email or username
    const isEmail = isValidEmail(usernameOrEmail);

    // Find user by email or username
    let user;
    if (isEmail) {
      user = await userRepository.findByEmail(usernameOrEmail, true);
    } else {
      user = await userRepository.findByUsername(usernameOrEmail, true);
    }

    // If user not found or password doesn't match
    if (!user) return null;

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return null;

    // Return user without password
    const userObject = user.toObject();
    delete userObject.password;

    return userObject;
  } catch (error) {
    logger.error(`Error in validateUserCredentials service:`, error);
    throw error;
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
  validateUserCredentials,
};
