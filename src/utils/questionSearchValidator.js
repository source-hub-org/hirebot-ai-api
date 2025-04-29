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

  // Optional topic parameter (previously required)
  if (params.topic !== undefined && typeof params.topic !== 'string') {
    errors.push('Topic must be a string');
  }

  // Optional language parameter (previously required)
  if (params.language !== undefined && typeof params.language !== 'string') {
    errors.push('Language must be a string');
  }

  // Optional position parameter (previously required)
  if (params.position !== undefined) {
    if (typeof params.position !== 'string') {
      errors.push('Position must be a string');
    } else {
      // Handle multiple positions separated by commas
      const positions = params.position.split(',').map(p => p.trim().toLowerCase());
      const validPositions = ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'];

      // Check if all positions are valid
      const invalidPositions = positions.filter(p => !validPositions.includes(p));

      if (invalidPositions.length > 0) {
        errors.push(`Position must be one of: ${validPositions.join(', ')}`);
      } else {
        // Normalize position to lowercase (keep the comma-separated format)
        params.position = positions.join(',');
      }
    }
  }

  // Optional sort_by parameter
  if (params.sort_by !== undefined) {
    const validSortFields = ['question', 'category', 'createdAt', 'random'];
    if (typeof params.sort_by !== 'string' || !validSortFields.includes(params.sort_by)) {
      errors.push(`sort_by must be one of: ${validSortFields.join(', ')}`);
    }
  } else {
    params.sort_by = 'random'; // Default value is now random
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

  // Optional mode parameter
  if (params.mode !== undefined) {
    const validModes = ['compact', 'full', 'minimalist'];
    if (typeof params.mode !== 'string' || !validModes.includes(params.mode.toLowerCase())) {
      errors.push(`mode must be one of: ${validModes.join(', ')}`);
    } else {
      // Normalize mode to lowercase
      params.mode = params.mode.toLowerCase();
    }
  } else {
    params.mode = 'full'; // Default value
  }

  // Optional ignore_question_ids parameter
  if (params.ignore_question_ids !== undefined) {
    if (typeof params.ignore_question_ids !== 'string') {
      errors.push('ignore_question_ids must be a string of comma-separated IDs');
    } else {
      // Process the string to get an array of IDs
      params.ignore_question_ids =
        params.ignore_question_ids.trim() === ''
          ? []
          : params.ignore_question_ids.split(',').map(id => id.trim());
    }
  } else {
    params.ignore_question_ids = []; // Default value is an empty array
  }

  return { params, errors };
}

module.exports = {
  validateSearchParams,
};
