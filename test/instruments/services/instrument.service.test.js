/**
 * Instrument Service Tests
 * @module test/instruments/services/instrument.service.test
 */

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const {
  createInstrumentItem,
  getAllInstrumentItems,
  getInstrumentItemById,
  getInstrumentItemsByTagId,
  updateInstrumentItem,
  deleteInstrumentItem,
} = require('../../../src/service/instrumentService');

// Mock the repository functions
jest.mock('../../../src/repository/instrumentRepository', () => ({
  createInstrument: jest.fn(),
  getAllInstruments: jest.fn(),
  getInstrumentById: jest.fn(),
  getInstrumentsByTagId: jest.fn(),
  updateInstrument: jest.fn(),
  deleteInstrument: jest.fn(),
  countInstruments: jest.fn(),
  countInstrumentsByTagId: jest.fn(),
}));

jest.mock('../../../src/repository/instrumentTagRepository', () => ({
  getInstrumentTagById: jest.fn(),
  getAllInstrumentTags: jest.fn(),
}));

// Import the mocked functions
const {
  createInstrument,
  getAllInstruments,
  getInstrumentById,
  getInstrumentsByTagId,
  updateInstrument,
  deleteInstrument,
  countInstruments,
  countInstrumentsByTagId,
} = require('../../../src/repository/instrumentRepository');

const {
  getInstrumentTagById,
  getAllInstrumentTags,
} = require('../../../src/repository/instrumentTagRepository');

jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the instrument service functions
 */
describe('Instrument Service', () => {
  let mongoServer;

  // Sample tag data for testing
  const sampleTag = {
    _id: 'tag-id-1',
    name: 'Personality',
    description: 'Tags related to personality tests and measurements.',
  };

  // Sample instrument data for testing
  const sampleInstrument = {
    _id: 'instrument-id-1',
    questionId: 'q1',
    questionText: 'I enjoy socializing with large groups of people.',
    type: 'scale',
    options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
    tags: [sampleTag._id],
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
   * Test creating an instrument
   */
  const testCreateInstrumentItem = () => {
    describe('createInstrumentItem', () => {
      it('should create an instrument successfully', async () => {
        // Arrange
        const instrumentData = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        // Mock tag verification
        getAllInstrumentTags.mockResolvedValue([sampleTag]);

        // Mock instrument creation
        createInstrument.mockResolvedValue(sampleInstrument);

        // Mock populated instrument
        getInstrumentById.mockResolvedValue({
          ...sampleInstrument,
          tags: [sampleTag],
        });

        // Act
        const result = await createInstrumentItem(instrumentData);

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(createInstrument).toHaveBeenCalledWith(instrumentData);
        expect(getInstrumentById).toHaveBeenCalledWith(sampleInstrument._id, {
          populate: ['tags'],
        });
        expect(result).toEqual({
          success: true,
          data: {
            ...sampleInstrument,
            tags: [sampleTag],
          },
        });
      });

      it('should return validation errors for invalid data', async () => {
        // Arrange
        const instrumentData = {
          // Missing questionId
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        // Act
        const result = await createInstrumentItem(instrumentData);

        // Assert
        expect(createInstrument).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Question ID is required'],
        });
      });

      it('should return error for invalid tag IDs', async () => {
        // Arrange
        const instrumentData = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: ['invalid-tag-id'],
        };

        // Mock tag verification - return fewer tags than requested
        getAllInstrumentTags.mockResolvedValue([]);

        // Act
        const result = await createInstrumentItem(instrumentData);

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(createInstrument).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['The following tag IDs do not exist: invalid-tag-id'],
        });
      });

      it('should handle duplicate questionId error', async () => {
        // Arrange
        const instrumentData = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        // Mock tag verification
        getAllInstrumentTags.mockResolvedValue([sampleTag]);

        // Mock duplicate key error
        const error = new Error('Duplicate key error');
        error.name = 'MongoServerError';
        error.code = 11000;
        error.keyPattern = { questionId: 1 };
        createInstrument.mockRejectedValue(error);

        // Act
        const result = await createInstrumentItem(instrumentData);

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(createInstrument).toHaveBeenCalledWith(instrumentData);
        expect(result).toEqual({
          success: false,
          errors: ['Instrument with this question ID already exists'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const instrumentData = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        // Mock tag verification
        getAllInstrumentTags.mockResolvedValue([sampleTag]);

        // Mock general error
        const error = new Error('Database error');
        createInstrument.mockRejectedValue(error);

        // Act
        const result = await createInstrumentItem(instrumentData);

        // Assert
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(createInstrument).toHaveBeenCalledWith(instrumentData);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test getting all instruments
   */
  const testGetAllInstrumentItems = () => {
    describe('getAllInstrumentItems', () => {
      it('should get all instruments with default pagination', async () => {
        // Arrange
        const instruments = [
          { ...sampleInstrument, tags: [sampleTag] },
          { ...sampleInstrument, _id: 'instrument-id-2', questionId: 'q2', tags: [sampleTag] },
        ];

        getAllInstruments.mockResolvedValue(instruments);
        countInstruments.mockResolvedValue(2);

        // Act
        const result = await getAllInstrumentItems();

        // Assert
        expect(getAllInstruments).toHaveBeenCalledWith(
          {},
          { populate: ['tags'], limit: 10, skip: 0, sort: { createdAt: -1 } }
        );
        expect(countInstruments).toHaveBeenCalledWith({});
        expect(result).toEqual({
          success: true,
          data: instruments,
          pagination: {
            page: 1,
            limit: 10,
            totalCount: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      });

      it('should apply query filters and pagination', async () => {
        // Arrange
        const query = {
          type: 'scale',
          page: '2',
          limit: '5',
          sort_by: 'questionId',
          sort_direction: 'asc',
        };

        const instruments = [{ ...sampleInstrument, tags: [sampleTag] }];

        getAllInstruments.mockResolvedValue(instruments);
        countInstruments.mockResolvedValue(6); // Total of 6 instruments, showing page 2 with 5 per page

        // Act
        const result = await getAllInstrumentItems(query);

        // Assert
        expect(getAllInstruments).toHaveBeenCalledWith(
          { type: 'scale' },
          { populate: ['tags'], limit: 5, skip: 5, sort: { questionId: 1 } }
        );
        expect(countInstruments).toHaveBeenCalledWith({ type: 'scale' });
        expect(result).toEqual({
          success: true,
          data: instruments,
          pagination: {
            page: 2,
            limit: 5,
            totalCount: 6,
            totalPages: 2,
            hasNextPage: false,
            hasPrevPage: true,
          },
        });
      });

      it('should handle errors', async () => {
        // Arrange
        const error = new Error('Database error');
        getAllInstruments.mockRejectedValue(error);

        // Act
        const result = await getAllInstrumentItems();

        // Assert
        expect(getAllInstruments).toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test getting an instrument by ID
   */
  const testGetInstrumentItemById = () => {
    describe('getInstrumentItemById', () => {
      it('should get an instrument by ID successfully', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const populatedInstrument = { ...sampleInstrument, tags: [sampleTag] };

        getInstrumentById.mockResolvedValue(populatedInstrument);

        // Act
        const result = await getInstrumentItemById(instrumentId);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId, { populate: ['tags'] });
        expect(result).toEqual({
          success: true,
          data: populatedInstrument,
        });
      });

      it('should return error if instrument not found', async () => {
        // Arrange
        const instrumentId = 'non-existent-id';
        getInstrumentById.mockResolvedValue(null);

        // Act
        const result = await getInstrumentItemById(instrumentId);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId, { populate: ['tags'] });
        expect(result).toEqual({
          success: false,
          errors: ['Instrument not found'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const instrumentId = 'invalid-id-format';
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        getInstrumentById.mockRejectedValue(error);

        // Act
        const result = await getInstrumentItemById(instrumentId);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId, { populate: ['tags'] });
        expect(result).toEqual({
          success: false,
          errors: ['Invalid instrument ID format'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const error = new Error('Database error');
        getInstrumentById.mockRejectedValue(error);

        // Act
        const result = await getInstrumentItemById(instrumentId);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId, { populate: ['tags'] });
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test getting instruments by tag ID
   */
  const testGetInstrumentItemsByTagId = () => {
    describe('getInstrumentItemsByTagId', () => {
      it('should get instruments by tag ID with default pagination', async () => {
        // Arrange
        const tagId = 'tag-id-1';
        const instruments = [
          { ...sampleInstrument, tags: [sampleTag] },
          { ...sampleInstrument, _id: 'instrument-id-2', questionId: 'q2', tags: [sampleTag] },
        ];

        // Mock tag verification
        getInstrumentTagById.mockResolvedValue(sampleTag);

        // Mock instruments retrieval
        getInstrumentsByTagId.mockResolvedValue(instruments);
        countInstrumentsByTagId.mockResolvedValue(2);

        // Act
        const result = await getInstrumentItemsByTagId(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(getInstrumentsByTagId).toHaveBeenCalledWith(tagId, {
          populate: ['tags'],
          limit: 10,
          skip: 0,
          sort: { createdAt: -1 },
        });
        expect(countInstrumentsByTagId).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: true,
          data: instruments,
          pagination: {
            page: 1,
            limit: 10,
            totalCount: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          },
        });
      });

      it('should apply query pagination', async () => {
        // Arrange
        const tagId = 'tag-id-1';
        const query = {
          page: '2',
          limit: '5',
          sort_by: 'questionId',
          sort_direction: 'asc',
        };

        const instruments = [{ ...sampleInstrument, tags: [sampleTag] }];

        // Mock tag verification
        getInstrumentTagById.mockResolvedValue(sampleTag);

        // Mock instruments retrieval
        getInstrumentsByTagId.mockResolvedValue(instruments);
        countInstrumentsByTagId.mockResolvedValue(6); // Total of 6 instruments, showing page 2 with 5 per page

        // Act
        const result = await getInstrumentItemsByTagId(tagId, query);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(getInstrumentsByTagId).toHaveBeenCalledWith(tagId, {
          populate: ['tags'],
          limit: 5,
          skip: 5,
          sort: { questionId: 1 },
        });
        expect(countInstrumentsByTagId).toHaveBeenCalledWith(tagId);
        expect(result).toEqual({
          success: true,
          data: instruments,
          pagination: {
            page: 2,
            limit: 5,
            totalCount: 6,
            totalPages: 2,
            hasNextPage: false,
            hasPrevPage: true,
          },
        });
      });

      it('should return error if tag not found', async () => {
        // Arrange
        const tagId = 'non-existent-tag-id';
        getInstrumentTagById.mockResolvedValue(null);

        // Act
        const result = await getInstrumentItemsByTagId(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(getInstrumentsByTagId).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Tag not found'],
        });
      });

      it('should handle invalid tag ID format', async () => {
        // Arrange
        const tagId = 'invalid-id-format';
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        getInstrumentTagById.mockRejectedValue(error);

        // Act
        const result = await getInstrumentItemsByTagId(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(getInstrumentsByTagId).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const tagId = 'tag-id-1';
        const error = new Error('Database error');
        getInstrumentTagById.mockResolvedValue(sampleTag);
        getInstrumentsByTagId.mockRejectedValue(error);

        // Act
        const result = await getInstrumentItemsByTagId(tagId);

        // Assert
        expect(getInstrumentTagById).toHaveBeenCalledWith(tagId);
        expect(getInstrumentsByTagId).toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test updating an instrument
   */
  const testUpdateInstrumentItem = () => {
    describe('updateInstrumentItem', () => {
      it('should update an instrument successfully', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const updateData = {
          questionText: 'Updated question text',
          options: ['Option 1', 'Option 2', 'Option 3'],
        };

        // Mock instrument retrieval
        getInstrumentById.mockResolvedValueOnce(sampleInstrument);

        // Mock update
        updateInstrument.mockResolvedValue({
          ...sampleInstrument,
          ...updateData,
        });

        // Mock populated instrument
        getInstrumentById.mockResolvedValueOnce({
          ...sampleInstrument,
          ...updateData,
          tags: [sampleTag],
        });

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(updateInstrument).toHaveBeenCalledWith(instrumentId, updateData);
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId, { populate: ['tags'] });
        // We only check for success and the presence of data
        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        expect(result.data._id).toBe(instrumentId);
        expect(result.data.questionText).toBe(updateData.questionText);
        expect(result.data.options).toEqual(expect.arrayContaining(updateData.options));
      });

      it('should return error if instrument not found', async () => {
        // Arrange
        const instrumentId = 'non-existent-id';
        const updateData = {
          questionText: 'Updated question text',
        };

        getInstrumentById.mockResolvedValue(null);

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(updateInstrument).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Instrument not found'],
        });
      });

      it('should validate tags if they are being updated', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const updateData = {
          tags: ['new-tag-id'],
        };

        // Mock instrument retrieval
        getInstrumentById.mockResolvedValue(sampleInstrument);

        // Mock tag verification - return fewer tags than requested
        getAllInstrumentTags.mockResolvedValue([]);

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(getAllInstrumentTags).toHaveBeenCalled();
        expect(updateInstrument).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['The following tag IDs do not exist: new-tag-id'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const instrumentId = 'invalid-id-format';
        const updateData = {
          questionText: 'Updated question text',
        };

        const error = new Error('Invalid ID');
        error.name = 'CastError';
        getInstrumentById.mockRejectedValue(error);

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(updateInstrument).not.toHaveBeenCalled();
        expect(result).toEqual({
          success: false,
          errors: ['Invalid instrument ID format'],
        });
      });

      it('should handle duplicate questionId error', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const updateData = {
          questionId: 'existing-question-id',
        };

        // Mock instrument retrieval
        getInstrumentById.mockResolvedValue(sampleInstrument);

        // Mock duplicate key error
        const error = new Error('Duplicate key error');
        error.name = 'MongoServerError';
        error.code = 11000;
        error.keyPattern = { questionId: 1 };
        updateInstrument.mockRejectedValue(error);

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(updateInstrument).toHaveBeenCalledWith(instrumentId, updateData);
        expect(result).toEqual({
          success: false,
          errors: ['Instrument with this question ID already exists'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const updateData = {
          questionText: 'Updated question text',
        };

        // Mock instrument retrieval
        getInstrumentById.mockResolvedValue(sampleInstrument);

        // Mock general error
        const error = new Error('Database error');
        updateInstrument.mockRejectedValue(error);

        // Act
        const result = await updateInstrumentItem(instrumentId, updateData);

        // Assert
        expect(getInstrumentById).toHaveBeenCalledWith(instrumentId);
        expect(updateInstrument).toHaveBeenCalledWith(instrumentId, updateData);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  /**
   * Test deleting an instrument
   */
  const testDeleteInstrumentItem = () => {
    describe('deleteInstrumentItem', () => {
      it('should delete an instrument successfully', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        deleteInstrument.mockResolvedValue(sampleInstrument);

        // Act
        const result = await deleteInstrumentItem(instrumentId);

        // Assert
        expect(deleteInstrument).toHaveBeenCalledWith(instrumentId);
        expect(result).toEqual({
          success: true,
          data: sampleInstrument,
        });
      });

      it('should return error if instrument not found', async () => {
        // Arrange
        const instrumentId = 'non-existent-id';
        deleteInstrument.mockResolvedValue(null);

        // Act
        const result = await deleteInstrumentItem(instrumentId);

        // Assert
        expect(deleteInstrument).toHaveBeenCalledWith(instrumentId);
        expect(result).toEqual({
          success: false,
          errors: ['Instrument not found'],
        });
      });

      it('should handle invalid ID format', async () => {
        // Arrange
        const instrumentId = 'invalid-id-format';
        const error = new Error('Invalid ID');
        error.name = 'CastError';
        deleteInstrument.mockRejectedValue(error);

        // Act
        const result = await deleteInstrumentItem(instrumentId);

        // Assert
        expect(deleteInstrument).toHaveBeenCalledWith(instrumentId);
        expect(result).toEqual({
          success: false,
          errors: ['Invalid instrument ID format'],
        });
      });

      it('should handle general errors', async () => {
        // Arrange
        const instrumentId = 'instrument-id-1';
        const error = new Error('Database error');
        deleteInstrument.mockRejectedValue(error);

        // Act
        const result = await deleteInstrumentItem(instrumentId);

        // Assert
        expect(deleteInstrument).toHaveBeenCalledWith(instrumentId);
        expect(result).toEqual({
          success: false,
          errors: ['Database error'],
        });
      });
    });
  };

  // Run all test functions
  testCreateInstrumentItem();
  testGetAllInstrumentItems();
  testGetInstrumentItemById();
  testGetInstrumentItemsByTagId();
  testUpdateInstrumentItem();
  testDeleteInstrumentItem();
});
