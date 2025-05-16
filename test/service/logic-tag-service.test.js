/**
 * Tests for Logic Tag Service
 */

const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
  checkLogicTagsExist,
} = require('../../src/services/logicTagService');
const {
  createLogicTag,
  getAllLogicTags,
  getLogicTagById,
  getLogicTagBySlug,
  updateLogicTag,
  deleteLogicTag,
  getLogicTagsByIds,
} = require('../../src/repository/logicTagRepository');
const formatSlug = require('../../src/utils/formatSlug');
const { isValidObjectId } = require('../../src/utils/validateObjectId');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/repository/logicTagRepository');
jest.mock('../../src/utils/formatSlug');
jest.mock('../../src/utils/validateObjectId');
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('Logic Tag Service', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  describe('createTag', () => {
    it('should create a tag successfully', async () => {
      // Mock data
      const tagData = {
        name: 'JavaScript',
        description: 'JavaScript programming language',
      };

      const formattedSlug = 'javascript';
      const createdTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript',
        slug: formattedSlug,
        description: 'JavaScript programming language',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      };

      // Setup mocks
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      createLogicTag.mockResolvedValue(createdTag);

      // Call the service
      const result = await createTag(tagData);

      // Verify results
      expect(formatSlug).toHaveBeenCalledWith('JavaScript');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(createLogicTag).toHaveBeenCalledWith({
        name: 'JavaScript',
        description: 'JavaScript programming language',
        slug: formattedSlug,
      });
      expect(logger.info).toHaveBeenCalledWith('Logic tag created successfully');
      expect(result).toEqual({
        success: true,
        data: createdTag,
      });
    });

    it('should handle validation errors', async () => {
      // Mock data with missing name
      const tagData = {
        description: 'JavaScript programming language',
      };

      // Call the service
      const result = await createTag(tagData);

      // Verify results
      expect(getLogicTagBySlug).not.toHaveBeenCalled();
      expect(createLogicTag).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Invalid logic tag data:', ['Tag name is required']);
      expect(result).toEqual({
        success: false,
        errors: ['Tag name is required'],
      });
    });

    it('should handle existing tag with same slug', async () => {
      // Mock data
      const tagData = {
        name: 'JavaScript',
        description: 'JavaScript programming language',
      };

      const formattedSlug = 'javascript';
      const existingTag = {
        _id: '60d21b4667d0d8992e610c85',
        name: 'JavaScript',
        slug: formattedSlug,
      };

      // Setup mocks
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(existingTag);

      // Call the service
      const result = await createTag(tagData);

      // Verify results
      expect(formatSlug).toHaveBeenCalledWith('JavaScript');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(createLogicTag).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Tag with slug '${formattedSlug}' already exists`);
      expect(result).toEqual({
        success: false,
        errors: [`Tag with slug '${formattedSlug}' already exists`],
      });
    });

    it('should handle duplicate key error', async () => {
      // Mock data
      const tagData = {
        name: 'JavaScript',
        description: 'JavaScript programming language',
      };

      const formattedSlug = 'javascript';
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;

      // Setup mocks
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      createLogicTag.mockRejectedValue(duplicateError);

      // Call the service
      const result = await createTag(tagData);

      // Verify results
      expect(formatSlug).toHaveBeenCalledWith('JavaScript');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(createLogicTag).toHaveBeenCalledWith({
        name: 'JavaScript',
        description: 'JavaScript programming language',
        slug: formattedSlug,
      });
      expect(logger.error).toHaveBeenCalledWith('Error creating logic tag:', duplicateError);
      expect(result).toEqual({
        success: false,
        errors: ['Tag with this name or slug already exists'],
      });
    });

    it('should handle generic error', async () => {
      // Mock data
      const tagData = {
        name: 'JavaScript',
        description: 'JavaScript programming language',
      };

      const formattedSlug = 'javascript';
      const genericError = new Error('Database connection failed');

      // Setup mocks
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      createLogicTag.mockRejectedValue(genericError);

      // Call the service
      const result = await createTag(tagData);

      // Verify results
      expect(formatSlug).toHaveBeenCalledWith('JavaScript');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(createLogicTag).toHaveBeenCalledWith({
        name: 'JavaScript',
        description: 'JavaScript programming language',
        slug: formattedSlug,
      });
      expect(logger.error).toHaveBeenCalledWith('Error creating logic tag:', genericError);
      expect(result).toEqual({
        success: false,
        errors: ['Error creating logic tag: Database connection failed'],
      });
    });
  });

  describe('getAllTags', () => {
    it('should get all tags successfully', async () => {
      // Mock data
      const mockTags = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'JavaScript',
          slug: 'javascript',
          description: 'JavaScript programming language',
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          name: 'Python',
          slug: 'python',
          description: 'Python programming language',
        },
      ];

      // Setup mocks
      getAllLogicTags.mockResolvedValue(mockTags);

      // Call the service
      const result = await getAllTags();

      // Verify results
      expect(getAllLogicTags).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: mockTags,
      });
    });

    it('should handle empty tags array', async () => {
      // Setup mocks
      getAllLogicTags.mockResolvedValue([]);

      // Call the service
      const result = await getAllTags();

      // Verify results
      expect(getAllLogicTags).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: [],
      });
    });

    it('should handle error', async () => {
      // Mock error
      const error = new Error('Database connection failed');

      // Setup mocks
      getAllLogicTags.mockRejectedValue(error);

      // Call the service
      const result = await getAllTags();

      // Verify results
      expect(getAllLogicTags).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('Error getting all logic tags:', error);
      expect(result).toEqual({
        success: false,
        errors: ['Error getting all logic tags: Database connection failed'],
      });
    });
  });

  describe('getTagById', () => {
    it('should get a tag by ID successfully', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const mockTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(mockTag);

      // Call the service
      const result = await getTagById(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(result).toEqual({
        success: true,
        data: mockTag,
      });
    });

    it('should handle invalid ID format', async () => {
      // Mock data
      const invalidId = 'invalid-id';

      // Setup mocks
      isValidObjectId.mockReturnValue(false);

      // Call the service
      const result = await getTagById(invalidId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(getLogicTagById).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid tag ID format: ${invalidId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Invalid tag ID format'],
      });
    });

    it('should handle tag not found', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(null);

      // Call the service
      const result = await getTagById(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(logger.warn).toHaveBeenCalledWith(`Tag not found with ID: ${tagId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Tag not found'],
      });
    });

    it('should handle error', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const error = new Error('Database connection failed');

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockRejectedValue(error);

      // Call the service
      const result = await getTagById(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(logger.error).toHaveBeenCalledWith(`Error getting logic tag with ID ${tagId}:`, error);
      expect(result).toEqual({
        success: false,
        errors: [`Error getting tag: Database connection failed`],
      });
    });
  });

  describe('updateTag', () => {
    it('should update a tag successfully', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'JavaScript ES6',
        description: 'Modern JavaScript with ES6+ features',
      };
      const formattedSlug = 'javascript-es6';
      const existingTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };
      const updatedTag = {
        _id: tagId,
        name: 'JavaScript ES6',
        slug: formattedSlug,
        description: 'Modern JavaScript with ES6+ features',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(existingTag);
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      updateLogicTag.mockResolvedValue(updatedTag);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(formatSlug).toHaveBeenCalledWith('JavaScript ES6');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(updateLogicTag).toHaveBeenCalledWith(tagId, {
        name: 'JavaScript ES6',
        description: 'Modern JavaScript with ES6+ features',
        slug: formattedSlug,
      });
      expect(logger.info).toHaveBeenCalledWith(`Logic tag with ID ${tagId} updated successfully`);
      expect(result).toEqual({
        success: true,
        data: updatedTag,
      });
    });

    it('should handle invalid ID format', async () => {
      // Mock data
      const invalidId = 'invalid-id';
      const updateData = {
        name: 'JavaScript ES6',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(false);

      // Call the service
      const result = await updateTag(invalidId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(getLogicTagById).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid tag ID format: ${invalidId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Invalid tag ID format'],
      });
    });

    it('should handle tag not found', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'JavaScript ES6',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(null);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(logger.warn).toHaveBeenCalledWith(`Tag not found with ID: ${tagId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Tag not found'],
      });
    });

    it('should handle validation errors', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: '',
        description: 123,
      };
      const existingTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(existingTag);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(logger.warn).toHaveBeenCalledWith('Invalid logic tag data:', [
        'Tag name cannot be empty',
        'Tag description must be a string',
      ]);
      expect(result).toEqual({
        success: false,
        errors: ['Tag name cannot be empty', 'Tag description must be a string'],
      });
    });

    it('should handle existing tag with same slug', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'JavaScript ES6',
      };
      const formattedSlug = 'javascript-es6';
      const existingTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };
      const conflictingTag = {
        _id: '60d21b4667d0d8992e610c86',
        name: 'JavaScript ES6',
        slug: formattedSlug,
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(existingTag);
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(conflictingTag);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(formatSlug).toHaveBeenCalledWith('JavaScript ES6');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(logger.warn).toHaveBeenCalledWith(
        `Another tag with slug '${formattedSlug}' already exists`
      );
      expect(result).toEqual({
        success: false,
        errors: [`Another tag with slug '${formattedSlug}' already exists`],
      });
    });

    it('should handle duplicate key error', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'JavaScript ES6',
      };
      const formattedSlug = 'javascript-es6';
      const existingTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };
      const duplicateError = new Error('Duplicate key error');
      duplicateError.code = 11000;

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(existingTag);
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      updateLogicTag.mockRejectedValue(duplicateError);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(formatSlug).toHaveBeenCalledWith('JavaScript ES6');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(updateLogicTag).toHaveBeenCalledWith(tagId, {
        name: 'JavaScript ES6',
        slug: formattedSlug,
      });
      expect(logger.error).toHaveBeenCalledWith(
        `Error updating logic tag with ID ${tagId}:`,
        duplicateError
      );
      expect(result).toEqual({
        success: false,
        errors: ['Tag with this name or slug already exists'],
      });
    });

    it('should handle generic error', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const updateData = {
        name: 'JavaScript ES6',
      };
      const formattedSlug = 'javascript-es6';
      const existingTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };
      const genericError = new Error('Database connection failed');

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(existingTag);
      formatSlug.mockReturnValue(formattedSlug);
      getLogicTagBySlug.mockResolvedValue(null);
      updateLogicTag.mockRejectedValue(genericError);

      // Call the service
      const result = await updateTag(tagId, updateData);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(formatSlug).toHaveBeenCalledWith('JavaScript ES6');
      expect(getLogicTagBySlug).toHaveBeenCalledWith(formattedSlug);
      expect(updateLogicTag).toHaveBeenCalledWith(tagId, {
        name: 'JavaScript ES6',
        slug: formattedSlug,
      });
      expect(logger.error).toHaveBeenCalledWith(
        `Error updating logic tag with ID ${tagId}:`,
        genericError
      );
      expect(result).toEqual({
        success: false,
        errors: [`Error updating tag: Database connection failed`],
      });
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag successfully', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const mockTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(mockTag);
      deleteLogicTag.mockResolvedValue(mockTag);

      // Call the service
      const result = await deleteTag(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(deleteLogicTag).toHaveBeenCalledWith(tagId);
      expect(logger.info).toHaveBeenCalledWith(`Logic tag with ID ${tagId} deleted successfully`);
      expect(result).toEqual({
        success: true,
        data: mockTag,
      });
    });

    it('should handle invalid ID format', async () => {
      // Mock data
      const invalidId = 'invalid-id';

      // Setup mocks
      isValidObjectId.mockReturnValue(false);

      // Call the service
      const result = await deleteTag(invalidId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(invalidId);
      expect(getLogicTagById).not.toHaveBeenCalled();
      expect(deleteLogicTag).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Invalid tag ID format: ${invalidId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Invalid tag ID format'],
      });
    });

    it('should handle tag not found', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(null);

      // Call the service
      const result = await deleteTag(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(deleteLogicTag).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith(`Tag not found with ID: ${tagId}`);
      expect(result).toEqual({
        success: false,
        errors: ['Tag not found'],
      });
    });

    it('should handle error', async () => {
      // Mock data
      const tagId = '60d21b4667d0d8992e610c85';
      const mockTag = {
        _id: tagId,
        name: 'JavaScript',
        slug: 'javascript',
        description: 'JavaScript programming language',
      };
      const error = new Error('Database connection failed');

      // Setup mocks
      isValidObjectId.mockReturnValue(true);
      getLogicTagById.mockResolvedValue(mockTag);
      deleteLogicTag.mockRejectedValue(error);

      // Call the service
      const result = await deleteTag(tagId);

      // Verify results
      expect(isValidObjectId).toHaveBeenCalledWith(tagId);
      expect(getLogicTagById).toHaveBeenCalledWith(tagId);
      expect(deleteLogicTag).toHaveBeenCalledWith(tagId);
      expect(logger.error).toHaveBeenCalledWith(
        `Error deleting logic tag with ID ${tagId}:`,
        error
      );
      expect(result).toEqual({
        success: false,
        errors: [`Error deleting tag: Database connection failed`],
      });
    });
  });

  describe('checkLogicTagsExist', () => {
    it('should confirm all tags exist', async () => {
      // Mock data
      const tagIds = ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'];
      const mockTags = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'JavaScript',
          slug: 'javascript',
        },
        {
          _id: '60d21b4667d0d8992e610c86',
          name: 'Python',
          slug: 'python',
        },
      ];

      // Setup mocks
      getLogicTagsByIds.mockResolvedValue(mockTags);

      // Call the service
      const result = await checkLogicTagsExist(tagIds);

      // Verify results
      expect(getLogicTagsByIds).toHaveBeenCalledWith(tagIds);
      expect(result).toEqual({
        success: true,
        data: mockTags,
      });
    });

    it('should handle some tags not existing', async () => {
      // Mock data
      const tagIds = ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'];
      const mockTags = [
        {
          _id: '60d21b4667d0d8992e610c85',
          name: 'JavaScript',
          slug: 'javascript',
        },
      ];

      // Setup mocks
      getLogicTagsByIds.mockResolvedValue(mockTags);

      // Call the service
      const result = await checkLogicTagsExist(tagIds);

      // Verify results
      expect(getLogicTagsByIds).toHaveBeenCalledWith(tagIds);
      expect(logger.warn).toHaveBeenCalledWith('Some logic tags do not exist:', [
        '60d21b4667d0d8992e610c86',
      ]);
      expect(result).toEqual({
        success: false,
        errors: ['One or more tags do not exist'],
        data: mockTags,
      });
    });

    it('should handle empty tag IDs array', async () => {
      // Call the service
      const result = await checkLogicTagsExist([]);

      // Verify results
      expect(getLogicTagsByIds).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
        data: [],
      });
    });

    it('should handle error', async () => {
      // Mock data
      const tagIds = ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'];
      const error = new Error('Database connection failed');

      // Setup mocks
      getLogicTagsByIds.mockRejectedValue(error);

      // Call the service
      const result = await checkLogicTagsExist(tagIds);

      // Verify results
      expect(getLogicTagsByIds).toHaveBeenCalledWith(tagIds);
      expect(logger.error).toHaveBeenCalledWith('Error checking if logic tags exist:', error);
      expect(result).toEqual({
        success: false,
        errors: ['Error checking if tags exist: Database connection failed'],
      });
    });
  });
});
