/**
 * Instrument Controller Tests
 * @module test/instruments/controllers/instrument.controller.test
 */

const {
  createInstrumentController,
} = require('../../../src/controllers/instruments/createInstrumentController');
const {
  getAllInstrumentsController,
} = require('../../../src/controllers/instruments/getAllInstrumentsController');
const {
  getInstrumentController,
} = require('../../../src/controllers/instruments/getInstrumentController');
const {
  getInstrumentsByTagController,
} = require('../../../src/controllers/instruments/getInstrumentsByTagController');
const {
  updateInstrumentController,
} = require('../../../src/controllers/instruments/updateInstrumentController');
const {
  deleteInstrumentController,
} = require('../../../src/controllers/instruments/deleteInstrumentController');

const {
  createInstrumentItem,
  getAllInstrumentItems,
  getInstrumentItemById,
  getInstrumentItemsByTagId,
  updateInstrumentItem,
  deleteInstrumentItem,
} = require('../../../src/service/instrumentService');

// Mock the service functions
jest.mock('../../../src/service/instrumentService');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the instrument controller functions
 */
describe('Instrument Controllers', () => {
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
    tags: [sampleTag],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Sample pagination data
  const samplePagination = {
    page: 1,
    page_size: 10,
    totalCount: 2,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Mock request and response objects
  let req;
  let res;

  // Reset mocks and recreate req/res before each test
  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  /**
   * Test the create instrument controller
   */
  const testCreateInstrumentController = () => {
    describe('createInstrumentController', () => {
      it('should create an instrument successfully', async () => {
        // Arrange
        req.body = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        createInstrumentItem.mockResolvedValue({
          success: true,
          data: sampleInstrument,
        });

        // Act
        await createInstrumentController(req, res);

        // Assert
        expect(createInstrumentItem).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: sampleInstrument,
        });
      });

      it('should return validation errors', async () => {
        // Arrange
        req.body = {
          // Missing questionId
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        createInstrumentItem.mockResolvedValue({
          success: false,
          errors: ['Question ID is required'],
        });

        // Act
        await createInstrumentController(req, res);

        // Assert
        expect(createInstrumentItem).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to create instrument.',
          errors: ['Question ID is required'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.body = {
          questionId: 'q1',
          questionText: 'I enjoy socializing with large groups of people.',
          type: 'scale',
          options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'],
          tags: [sampleTag._id],
        };

        createInstrumentItem.mockRejectedValue(new Error('Server error'));

        // Act
        await createInstrumentController(req, res);

        // Assert
        expect(createInstrumentItem).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to create instrument.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the get all instruments controller
   */
  const testGetAllInstrumentsController = () => {
    describe('getAllInstrumentsController', () => {
      it('should get all instruments successfully', async () => {
        // Arrange
        req.query = {
          page: '1',
          page_size: '10',
        };

        const instruments = [
          sampleInstrument,
          { ...sampleInstrument, _id: 'instrument-id-2', questionId: 'q2' },
        ];

        getAllInstrumentItems.mockResolvedValue({
          success: true,
          data: instruments,
          pagination: samplePagination,
        });

        // Act
        await getAllInstrumentsController(req, res);

        // Assert
        expect(getAllInstrumentItems).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: instruments,
          pagination: samplePagination,
        });
      });

      it('should handle errors', async () => {
        // Arrange
        getAllInstrumentItems.mockResolvedValue({
          success: false,
          errors: ['Database error'],
        });

        // Act
        await getAllInstrumentsController(req, res);

        // Assert
        expect(getAllInstrumentItems).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instruments.',
          errors: ['Database error'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        getAllInstrumentItems.mockRejectedValue(new Error('Server error'));

        // Act
        await getAllInstrumentsController(req, res);

        // Assert
        expect(getAllInstrumentItems).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instruments.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the get instrument by ID controller
   */
  const testGetInstrumentController = () => {
    describe('getInstrumentController', () => {
      it('should get an instrument by ID successfully', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';

        getInstrumentItemById.mockResolvedValue({
          success: true,
          data: sampleInstrument,
        });

        // Act
        await getInstrumentController(req, res);

        // Assert
        expect(getInstrumentItemById).toHaveBeenCalledWith('instrument-id-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: sampleInstrument,
        });
      });

      it('should return 404 if instrument not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';

        getInstrumentItemById.mockResolvedValue({
          success: false,
          errors: ['Instrument not found'],
        });

        // Act
        await getInstrumentController(req, res);

        // Assert
        expect(getInstrumentItemById).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument.',
          errors: ['Instrument not found'],
        });
      });

      it('should return 400 for invalid ID format', async () => {
        // Arrange
        req.params.id = 'invalid-id-format';

        getInstrumentItemById.mockResolvedValue({
          success: false,
          errors: ['Invalid instrument ID format'],
        });

        // Act
        await getInstrumentController(req, res);

        // Assert
        expect(getInstrumentItemById).toHaveBeenCalledWith('invalid-id-format');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument.',
          errors: ['Invalid instrument ID format'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';

        getInstrumentItemById.mockRejectedValue(new Error('Server error'));

        // Act
        await getInstrumentController(req, res);

        // Assert
        expect(getInstrumentItemById).toHaveBeenCalledWith('instrument-id-1');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the get instruments by tag controller
   */
  const testGetInstrumentsByTagController = () => {
    describe('getInstrumentsByTagController', () => {
      it('should get instruments by tag ID successfully', async () => {
        // Arrange
        req.params.tagId = 'tag-id-1';
        req.query = {
          page: '1',
          page_size: '10',
        };

        const instruments = [
          sampleInstrument,
          { ...sampleInstrument, _id: 'instrument-id-2', questionId: 'q2' },
        ];

        getInstrumentItemsByTagId.mockResolvedValue({
          success: true,
          data: instruments,
          pagination: samplePagination,
        });

        // Act
        await getInstrumentsByTagController(req, res);

        // Assert
        expect(getInstrumentItemsByTagId).toHaveBeenCalledWith('tag-id-1', req.query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: instruments,
          pagination: samplePagination,
        });
      });

      it('should return 400 for invalid tag ID', async () => {
        // Arrange
        req.params.tagId = 'invalid-tag-id';

        getInstrumentItemsByTagId.mockResolvedValue({
          success: false,
          errors: ['Invalid tag ID format'],
        });

        // Act
        await getInstrumentsByTagController(req, res);

        // Assert
        expect(getInstrumentItemsByTagId).toHaveBeenCalledWith('invalid-tag-id', req.query);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instruments by tag.',
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.tagId = 'tag-id-1';

        getInstrumentItemsByTagId.mockRejectedValue(new Error('Server error'));

        // Act
        await getInstrumentsByTagController(req, res);

        // Assert
        expect(getInstrumentItemsByTagId).toHaveBeenCalledWith('tag-id-1', req.query);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instruments by tag.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the update instrument controller
   */
  const testUpdateInstrumentController = () => {
    describe('updateInstrumentController', () => {
      it('should update an instrument successfully', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';
        req.body = {
          questionText: 'Updated question text',
          options: ['Option 1', 'Option 2', 'Option 3'],
        };

        const updatedInstrument = {
          ...sampleInstrument,
          questionText: 'Updated question text',
          options: ['Option 1', 'Option 2', 'Option 3'],
        };

        updateInstrumentItem.mockResolvedValue({
          success: true,
          data: updatedInstrument,
        });

        // Act
        await updateInstrumentController(req, res);

        // Assert
        expect(updateInstrumentItem).toHaveBeenCalledWith('instrument-id-1', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: updatedInstrument,
        });
      });

      it('should return 404 if instrument not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';
        req.body = {
          questionText: 'Updated question text',
        };

        updateInstrumentItem.mockResolvedValue({
          success: false,
          errors: ['Instrument not found'],
        });

        // Act
        await updateInstrumentController(req, res);

        // Assert
        expect(updateInstrumentItem).toHaveBeenCalledWith('non-existent-id', req.body);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument.',
          errors: ['Instrument not found'],
        });
      });

      it('should return 400 for validation errors', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';
        req.body = {
          type: 'invalid-type',
        };

        updateInstrumentItem.mockResolvedValue({
          success: false,
          errors: ['Type must be one of: scale, multiple-choice, open-ended, boolean'],
        });

        // Act
        await updateInstrumentController(req, res);

        // Assert
        expect(updateInstrumentItem).toHaveBeenCalledWith('instrument-id-1', req.body);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument.',
          errors: ['Type must be one of: scale, multiple-choice, open-ended, boolean'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';
        req.body = {
          questionText: 'Updated question text',
        };

        updateInstrumentItem.mockRejectedValue(new Error('Server error'));

        // Act
        await updateInstrumentController(req, res);

        // Assert
        expect(updateInstrumentItem).toHaveBeenCalledWith('instrument-id-1', req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the delete instrument controller
   */
  const testDeleteInstrumentController = () => {
    describe('deleteInstrumentController', () => {
      it('should delete an instrument successfully', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';

        deleteInstrumentItem.mockResolvedValue({
          success: true,
          data: sampleInstrument,
        });

        // Act
        await deleteInstrumentController(req, res);

        // Assert
        expect(deleteInstrumentItem).toHaveBeenCalledWith('instrument-id-1');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Instrument deleted successfully',
          data: sampleInstrument,
        });
      });

      it('should return 404 if instrument not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';

        deleteInstrumentItem.mockResolvedValue({
          success: false,
          errors: ['Instrument not found'],
        });

        // Act
        await deleteInstrumentController(req, res);

        // Assert
        expect(deleteInstrumentItem).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument.',
          errors: ['Instrument not found'],
        });
      });

      it('should return 400 for invalid ID format', async () => {
        // Arrange
        req.params.id = 'invalid-id-format';

        deleteInstrumentItem.mockResolvedValue({
          success: false,
          errors: ['Invalid instrument ID format'],
        });

        // Act
        await deleteInstrumentController(req, res);

        // Assert
        expect(deleteInstrumentItem).toHaveBeenCalledWith('invalid-id-format');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument.',
          errors: ['Invalid instrument ID format'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'instrument-id-1';

        deleteInstrumentItem.mockRejectedValue(new Error('Server error'));

        // Act
        await deleteInstrumentController(req, res);

        // Assert
        expect(deleteInstrumentItem).toHaveBeenCalledWith('instrument-id-1');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  // Run all test functions
  testCreateInstrumentController();
  testGetAllInstrumentsController();
  testGetInstrumentController();
  testGetInstrumentsByTagController();
  testUpdateInstrumentController();
  testDeleteInstrumentController();
});
