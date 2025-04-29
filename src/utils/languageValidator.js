/**
 * Language Validator Module
 * @module utils/languageValidator
 */

/**
 * Validates a language object
 * @param {Object} language - The language object to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateLanguage(language) {
  const errors = [];

  // Check if language is an object
  if (!language || typeof language !== 'object') {
    return {
      isValid: false,
      errors: ['Language data must be an object'],
    };
  }

  // Validate required fields
  if (!language.name) {
    errors.push('Language name is required');
  } else if (typeof language.name !== 'string') {
    errors.push('Language name must be a string');
  }

  if (!language.designed_by) {
    errors.push('Designer information is required');
  } else if (typeof language.designed_by !== 'string') {
    errors.push('Designer information must be a string');
  }

  if (language.first_appeared === undefined) {
    errors.push('First appearance year is required');
  } else if (typeof language.first_appeared !== 'number' || language.first_appeared < 1940) {
    errors.push('First appearance year must be a number greater than or equal to 1940');
  }

  if (!language.paradigm) {
    errors.push('Paradigm is required');
  } else if (!Array.isArray(language.paradigm) || language.paradigm.length === 0) {
    errors.push('Paradigm must be a non-empty array');
  } else {
    // Check if all paradigm elements are strings
    const nonStringParadigms = language.paradigm.filter(p => typeof p !== 'string');
    if (nonStringParadigms.length > 0) {
      errors.push('All paradigm elements must be strings');
    }
  }

  if (!language.usage) {
    errors.push('Usage information is required');
  } else if (typeof language.usage !== 'string') {
    errors.push('Usage information must be a string');
  }

  if (language.popularity_rank === undefined) {
    errors.push('Popularity rank is required');
  } else if (typeof language.popularity_rank !== 'number' || language.popularity_rank < 1) {
    errors.push('Popularity rank must be a number greater than or equal to 1');
  }

  if (!language.type_system) {
    errors.push('Type system information is required');
  } else if (typeof language.type_system !== 'string') {
    errors.push('Type system information must be a string');
  }

  // Validate slug if provided
  if (language.slug !== undefined && typeof language.slug !== 'string') {
    errors.push('Slug must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an array of language objects
 * @param {Array<Object>} data - Array of language objects to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateLanguagesData(data) {
  const errors = [];

  // Check if data is an array
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Languages data must be an array'],
    };
  }

  // Check if array is empty
  if (data.length === 0) {
    return {
      isValid: false,
      errors: ['Languages data array cannot be empty'],
    };
  }

  // Validate each language object
  data.forEach((language, index) => {
    const validation = validateLanguage(language);
    if (!validation.isValid) {
      errors.push(`Language at index ${index} is invalid: ${validation.errors.join(', ')}`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  validateLanguage,
  validateLanguagesData,
};
