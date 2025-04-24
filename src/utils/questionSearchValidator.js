/**
 * Question Search Validator Module
 * @module utils/questionSearchValidator
 */

/**
 * Validates search parameters from the request query
 * @param {Object} query - The request query object
 * @returns {Object} Object containing validated params and any validation errors
 */
function validateSearchParams(query) {
  const errors = [];
  const params = { ...query };

  // Required string parameters: topic, language, position
  if (!params.topic || typeof params.topic !== 'string') {
    errors.push('Topic is required and must be a string');
  }

  if (!params.language || typeof params.language !== 'string') {
    errors.push('Language is required and must be a string');
  }

  if (!params.position || typeof params.position !== 'string') {
    errors.push('Position is required and must be a string');
  } else {
    // Validate position is one of the allowed values
    const validPositions = ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'];
    if (!validPositions.includes(params.position.toLowerCase())) {
      errors.push(`Position must be one of: ${validPositions.join(', ')}`);
    } else {
      // Normalize position to lowercase
      params.position = params.position.toLowerCase();
    }
  }

  // Optional sort_by parameter
  if (params.sort_by !== undefined) {
    const validSortFields = ['question', 'category', 'createdAt'];
    if (typeof params.sort_by !== 'string' || !validSortFields.includes(params.sort_by)) {
      errors.push(`sort_by must be one of: ${validSortFields.join(', ')}`);
    }
  } else {
    params.sort_by = 'createdAt'; // Default value
  }

  // Optional sort_direction parameter
  if (params.sort_direction !== undefined) {
    const validDirections = ['asc', 'desc'];
    if (
      typeof params.sort_direction !== 'string' ||
      !validDirections.includes(params.sort_direction.toLowerCase())
    ) {
      errors.push(`sort_direction must be one of: ${validDirections.join(', ')}`);
    } else {
      // Normalize sort_direction to lowercase
      params.sort_direction = params.sort_direction.toLowerCase();
    }
  } else {
    params.sort_direction = 'desc'; // Default value
  }

  // Optional page parameter
  if (params.page !== undefined) {
    const pageNum = parseInt(params.page);
    if (isNaN(pageNum) || pageNum < 1) {
      errors.push('page must be a positive integer');
    } else {
      params.page = pageNum;
    }
  } else {
    params.page = 1; // Default value
  }

  // Optional page_size parameter
  if (params.page_size !== undefined) {
    const pageSizeNum = parseInt(params.page_size);
    if (isNaN(pageSizeNum) || pageSizeNum < 1) {
      errors.push('page_size must be a positive integer');
    } else {
      params.page_size = pageSizeNum;
    }
  } else {
    params.page_size = 20; // Default value
  }

  return { params, errors };
}

module.exports = {
  validateSearchParams,
};
