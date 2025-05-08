/**
 * Instrument Tag Service Tests
 * @module test/instruments/services/instrumentTag.service.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} = require('../../../src/service/instrumentTagService');

// Mock the repository functions
jest.mock('../../../src/repository/instrumentTagRepository', () => ({
  createInstrumentTag: jest.fn(),
  getAllInstrumentTags: jest.fn(),
  getInstrumentTagById: jest.fn(),
  updateInstrumentTag: jest.fn(),
  deleteInstrumentTag: jest.fn(),
}));

// Import the mocked functions
const {
  createInstrumentTag,
  getAllInstrumentTags,
  getInstrumentTagById,
  updateInstrumentTag,
  deleteInstrumentTag,
} = require('../../../src/repository/instrumentTagRepository');

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the instrument tag service functions
 */
describe('Instrument Tag Service', () => {
  let mongoServer;

  // Sample tag data for testing
  const sampleTag = {
    _id: 'mock-id',
    name: 'Personality',
    description: 'Tags related to personality tests and measurements.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Setup MongoDB Memory Server before tests
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test creating a tag
   */
  const testCreateTag = () => {
    describe('createTag', () => {
      it('should create a tag successfully', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        createInstrumentTag.mockResolvedValue(sampleTag);

        // Act
        const result = await createTag(tagData);

        // Assert
        expect(createInstrumentTag).toHaveBeenCalledWith(tagData);
        expect(result).toEqual({
          success: true,
          data: sampleTag,
        });
      });

      it('should return validation errors for invalid data', async () => {
        // Arrange
        const tagData = {
          // Missing name
          description: 'Tags related to personality tests and measurements.',
        };

        // Act
        const result = await createTag(tagData);

        // Assert
        expect(createInstrumentTag).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Tag name is required'],
        });
      });

      it('should handle duplicate name error', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        const error = new Error('Duplicate key error');
        error.name = 'MongoServerError';
        error.code = 11000;
        error.keyPattern = { name: 1 };

        createInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await createTag(tagData);

        // Assert
        expect(createInstrumentTag).toHaveBeenCalledWith(tagData);
        expect(result).toEqual({
          success: false,
          errors: ['Tag with this name already exists'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const tagData = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        const error = new Error('Database error');
        createInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await createTag(tagData);

        // Assert
        expect(createInstrumentTag).toHaveBeenCalledWith(tagData);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test getting all tags
   */
  const testGetAllTags = () => {
    describe('getAllTags', () => {
      it('should get all tags successfully', async () => {
        // Arrange
        const tags = [sampleTag, { ...sampleTag, _id: 'mock-id-2', name: 'Cognitive' }];
        getAllInstrumentTags.mockResolvedValue(tags);

        // Act
        const result = await getAllTags();

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(result).toEqual({
          success: true,
          data: tags,
        });
      });

      it('should handle errors', async () => {
        // Arrange
        const error = new Error('Database error');
        getAllInstrumentTags.mockRejectedValue(error);

        // Act
        const result = await getAllTags();

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test getting a tag by ID
   */
  const testGetTagById = () => {
    describe('getTagById', () => {
      it('should get a tag by ID successfully', async () => {
        // Arrange
        const tagId = 'mock-id';
        getInstrumentTagById.mockResolvedValue(sampleTag);

        // Act
        const result = await getTagById(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: true,
          data: sampleTag,
        });
      });

      it('should return error if tag not found', async () => {
        // Arrange
        const tagId = 'non-existent-id';
        getInstrumentTagById.mockResolvedValue(null);

        // Act
        const result = await getTagById(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Tag not found'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const tagId = 'invalid-id-format';
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        getInstrumentTagById.mockRejectedValue(error);

        // Act
        const result = await getTagById(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const tagId = 'mock-id';
        const error = new Error('Database error');
        getInstrumentTagById.mockRejectedValue(error);

        // Act
        const result = await getTagById(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test updating a tag
   */
  const testUpdateTag = () => {
    describe('updateTag', () => {
      it('should update a tag successfully', async () => {
        // Arrange
        const tagId = 'mock-id';
        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };
        const updatedTag = { ...sampleTag, ...updateData };
        updateInstrumentTag.mockResolvedValue(updatedTag);

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).toHaveBeenCalledWith(tagId, updateData);
        expect(result).toEqual({
          success: true,
          data: updatedTag,
        });
      });

      it('should return validation errors for invalid data', async () => {
        // Arrange
        const tagId = 'mock-id';
        const updateData = {
          // Missing name
          description: 'Updated description',
        };

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Tag name is required'],
        });
      });

      it('should return error if tag not found', async () => {
        // Arrange
        const tagId = 'non-existent-id';
        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };
        updateInstrumentTag.mockResolvedValue(null);

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).toHaveBeenCalledWith(tagId, updateData);
        expect(result).toEqual({
          success: false,
          errors: ['Tag not found'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const tagId = 'invalid-id-format';
        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        updateInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).toHaveBeenCalled(); // Repository call happens
        expect(result).toEqual({
          success: false,
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle duplicate name error', async () => {
        // Arrange
        const tagId = 'mock-id';
        const updateData = {
          name: 'Existing Tag',
          description: 'Updated description',
        };
        const error = new Error('Duplicate key error');
        error.name = 'MongoServerError';
        error.code = 11000;
        error.keyPattern = { name: 1 };
        updateInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).toHaveBeenCalledWith(tagId, updateData);
        expect(result).toEqual({
          success: false,
          errors: ['Tag with this name already exists'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const tagId = 'mock-id';
        const updateData = {
          name: 'Updated Personality',
          description: 'Updated description',
        };
        const error = new Error('Database error');
        updateInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await updateTag(tagId, updateData);

        // Assert
        expect(updateInstrumentTag).toHaveBeenCalledWith(tagId, updateData);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test deleting a tag
   */
  const testDeleteTag = () => {
    describe('deleteTag', () => {
      it('should delete a tag successfully', async () => {
        // Arrange
        const tagId = 'mock-id';
        deleteInstrumentTag.mockResolvedValue(sampleTag);

        // Act
        const result = await deleteTag(tagId);

        // Assert
        expect(deleteInstrumentTag).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: true,
          data: sampleTag,
        });
      });

      it('should return error if tag not found', async () => {
        // Arrange
        const tagId = 'non-existent-id';
        deleteInstrumentTag.mockResolvedValue(null);

        // Act
        const result = await deleteTag(tagId);

        // Assert
        expect(deleteInstrumentTag).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Tag not found'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const tagId = 'invalid-id-format';
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        deleteInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await deleteTag(tagId);

        // Assert
        expect(deleteInstrumentTag).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const tagId = 'mock-id';
        const error = new Error('Database error');
        deleteInstrumentTag.mockRejectedValue(error);

        // Act
        const result = await deleteTag(tagId);

        // Assert
        expect(deleteInstrumentTag).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  // Run all test functions
  testCreateTag();
  testGetAllTags();
  testGetTagById();
  testUpdateTag();
  testDeleteTag();
});
