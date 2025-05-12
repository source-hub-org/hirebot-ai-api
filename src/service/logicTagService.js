/**
 * Logic Tag Service Module
 * @module service/logicTagService
 */

const {
  createLogicTag,
  getAllLogicTags,
  getLogicTagById,
  getLogicTagBySlug,
  updateLogicTag,
  deleteLogicTag,
  getLogicTagsByIds,
} = require('../repository/logicTagRepository');
const formatSlug = require('../utils/formatSlug');
const { isValidObjectId } = require('../utils/validateObjectId');
const logger = require('../utils/logger');

/**
 * Validate logic tag data
 * @param {Object} tagData - Tag data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validateLogicTagData(tagData) {
  const errors = [];

  // Check if name is provided and is a string
  if (!tagData.name) {
    errors.push('Tag name is required');
  } else if (typeof tagData.name !== 'string') {
    errors.push('Tag name must be a string');
  } else if (tagData.name.trim().length === 0) {
    errors.push('Tag name cannot be empty');
  }

  // Description is optional but must be a string if provided
  if (tagData.description !== undefined && typeof tagData.description !== 'string') {
    errors.push('Tag description must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Create a new logic tag
 * @async
 * @param {Object} tagData - Data for the new tag
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function createTag(tagData) {
  try {
    // Validate tag data
    const validation = validateLogicTagData(tagData);
    if (!validation.isValid) {
      logger.warn('Invalid logic tag data:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Generate slug from name if not provided
    if (!tagData.slug) {
      tagData.slug = formatSlug(tagData.name);
    } else {
      tagData.slug = formatSlug(tagData.slug);
    }

    // Check if tag with same slug already exists
    const existingTag = await getLogicTagBySlug(tagData.slug);
    if (existingTag) {
      logger.warn(`Tag with slug '${tagData.slug}' already exists`);
      return {
        success: false,
        errors: [`Tag with slug '${tagData.slug}' already exists`],
      };
    }

    // Create tag
    const tag = await createLogicTag(tagData);
    logger.info('Logic tag created successfully');

    return {
      success: true,
      data: tag,
    };
  } catch (error) {
    logger.error('Error creating logic tag:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return {
        success: false,
        errors: ['Tag with this name or slug already exists'],
      };
    }

    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Get all logic tags
 * @async
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function getAllTags() {
  try {
    const tags = await getAllLogicTags();
    logger.info(`Retrieved ${tags.length} logic tags`);

    return {
      success: true,
      data: tags,
    };
  } catch (error) {
    logger.error('Error retrieving logic tags:', error);

    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Get logic tag by ID
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function getTagById(id) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic tag ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid tag ID format'],
      };
    }

    const tag = await getLogicTagById(id);

    if (!tag) {
      logger.warn(`Logic tag with ID ${id} not found`);
      return {
        success: false,
        errors: ['Tag not found'],
      };
    }

    logger.info(`Retrieved logic tag with ID ${id}`);
    return {
      success: true,
      data: tag,
    };
  } catch (error) {
    logger.error(`Error retrieving logic tag with ID ${id}:`, error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Update logic tag
 * @async
 * @param {string} id - Tag ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function updateTag(id, updateData) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic tag ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid tag ID format'],
      };
    }

    // Validate update data
    const validation = validateLogicTagData(updateData);
    if (!validation.isValid) {
      logger.warn('Invalid logic tag update data:', validation.errors);
      return {
        success: false,
        errors: validation.errors,
      };
    }

    // Generate slug from name if name is being updated
    if (updateData.name && !updateData.slug) {
      updateData.slug = formatSlug(updateData.name);
    } else if (updateData.slug) {
      updateData.slug = formatSlug(updateData.slug);
    }

    // Check if tag with same slug already exists (excluding current tag)
    if (updateData.slug) {
      const existingTag = await getLogicTagBySlug(updateData.slug);
      if (existingTag && existingTag._id.toString() !== id) {
        logger.warn(`Tag with slug '${updateData.slug}' already exists`);
        return {
          success: false,
          errors: [`Tag with slug '${updateData.slug}' already exists`],
        };
      }
    }

    const updatedTag = await updateLogicTag(id, updateData);

    if (!updatedTag) {
      logger.warn(`Logic tag with ID ${id} not found for update`);
      return {
        success: false,
        errors: ['Tag not found'],
      };
    }

    logger.info(`Updated logic tag with ID ${id}`);
    return {
      success: true,
      data: updatedTag,
    };
  } catch (error) {
    logger.error(`Error updating logic tag with ID ${id}:`, error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return {
        success: false,
        errors: ['Tag with this name or slug already exists'],
      };
    }

    return {
      success: false,
      errors: [error.message],
    };
  }
}

/**
 * Delete logic tag
 * @async
 * @param {string} id - Tag ID
 * @returns {Promise<Object>} Result object with success flag, data, and errors
 */
async function deleteTag(id) {
  try {
    // Validate ID format
    if (!isValidObjectId(id)) {
      logger.warn(`Invalid logic tag ID format: ${id}`);
      return {
        success: false,
        errors: ['Invalid tag ID format'],
      };
    }

    const deletedTag = await deleteLogicTag(id);

    if (!deletedTag) {
      logger.warn(`Logic tag with ID ${id} not found for deletion`);
      return {
        success: false,
        errors: ['Tag not found'],
      };
    }

    logger.info(`Deleted logic tag with ID ${id}`);
    return {
      success: true,
      data: deletedTag,
    };
  } catch (error) {
    logger.error(`Error deleting logic tag with ID ${id}:`, error);
    return {
      success: false,
      errors: [error.message],
    };
  }
}

module.exports = {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
};
