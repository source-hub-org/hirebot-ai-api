/**
 * Pagination Utilities Module
 * @module utils/paginationUtils
 */

/**
 * Parse and normalize pagination parameters from query string
 * @param {Object} query - Express request query object
 * @returns {Object} Normalized pagination parameters
 */
function parsePaginationParams(query) {
  // Parse page parameter
  let page = parseInt(query.page, 10);

  // Apply defaults and constraints to page
  if (isNaN(page) || page < 1) {
    page = 1;
  }

  // Parse page_size parameter
  let pageSize = parseInt(query.page_size, 10);

  // Apply defaults and constraints to page_size
  if (isNaN(pageSize) || pageSize < 1) {
    pageSize = 20;
  } else if (pageSize > 100) {
    pageSize = 100;
  }

  return {
    page,
    pageSize,
  };
}

/**
 * Calculate pagination pagination
 * @param {number} total - Total number of items
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} Pagination pagination
 */
function calculatePaginationMetadata(total, page, pageSize) {
  // Calculate total pages (ceiling of total / pageSize)
  const totalPages = Math.ceil(total / pageSize);

  return {
    total,
    page,
    page_size: pageSize,
    total_pages: totalPages,
  };
}

/**
 * Calculate MongoDB skip value based on page and pageSize
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {number} Number of documents to skip
 */
function calculateSkipValue(page, pageSize) {
  return (page - 1) * pageSize;
}

/**
 * Generate pagination options for MongoDB queries
 * @param {number} page - Current page number
 * @param {number} pageSize - Number of items per page
 * @returns {Object} MongoDB query options with skip and limit
 */
function generatePaginationOptions(page, pageSize) {
  const skip = calculateSkipValue(page, pageSize);

  return {
    skip,
    limit: pageSize,
  };
}

module.exports = {
  parsePaginationParams,
  calculatePaginationMetadata,
  calculateSkipValue,
  generatePaginationOptions,
};
