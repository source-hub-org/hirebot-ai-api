/**
 * Instrument Tag Controller Tests
 * @module test/instruments/controllers/instrumentTag.controller.test
 */

const {
  createInstrumentTagController,
} = require('../../../src/controllers/instrument-tags/createInstrumentTagController');
const {
  getAllInstrumentTagsController,
} = require('../../../src/controllers/instrument-tags/getAllInstrumentTagsController');
const {
  getInstrumentTagController,
} = require('../../../src/controllers/instrument-tags/getInstrumentTagController');
const {
  updateInstrumentTagController,
} = require('../../../src/controllers/instrument-tags/updateInstrumentTagController');
const {
  deleteInstrumentTagController,
} = require('../../../src/controllers/instrument-tags/deleteInstrumentTagController');

const {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} = require('../../../src/services/instrumentTagService');

// Mock the service functions
jest.mock('../../../src/services/instrumentTagService');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the instrument tag controller functions
 */
describe('Instrument Tag Controllers', () => {
  // Sample tag data for testing
  const sampleTag = {
    _id: 'mock-id',
    name: 'Personality',
    description: 'Tags related to personality tests and measurements.',
    createdAt: new Date(),
    updatedAt: new Date(),
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
   * Test the create instrument tag controller
   */
  const testCreateInstrumentTagController = () => {
    describe('createInstrumentTagController', () => {
      it('should create a tag successfully', async () => {
        // Arrange
        req.body = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        createTag.mockResolvedValue({
          success: true,
          data: sampleTag,
        });

        // Act
        await createInstrumentTagController(req, res);

        // Assert
        expect(createTag).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: sampleTag,
        });
      });

      it('should return validation errors', async () => {
        // Arrange
        req.body = {
          // Missing name
          description: 'Tags related to personality tests and measurements.',
        };

        createTag.mockResolvedValue({
          success: false,
          errors: ['Tag name is required'],
        });

        // Act
        await createInstrumentTagController(req, res);

        // Assert
        expect(createTag).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to create instrument tag.',
          errors: ['Tag name is required'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.body = {
          name: 'Personality',
          description: 'Tags related to personality tests and measurements.',
        };

        createTag.mockRejectedValue(new Error('Server error'));

        // Act
        await createInstrumentTagController(req, res);

        // Assert
        expect(createTag).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to create instrument tag.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the get all instrument tags controller
   */
  const testGetAllInstrumentTagsController = () => {
    describe('getAllInstrumentTagsController', () => {
      it('should get all tags successfully', async () => {
        // Arrange
        const tags = [sampleTag, { ...sampleTag, _id: 'mock-id-2', name: 'Cognitive' }];

        getAllTags.mockResolvedValue({
          success: true,
          data: tags,
        });

        // Act
        await getAllInstrumentTagsController(req, res);

        // Assert
        expect(getAllTags).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: tags,
        });
      });

      it('should handle errors', async () => {
        // Arrange
        getAllTags.mockResolvedValue({
          success: false,
          errors: ['Database error'],
        });

        // Act
        await getAllInstrumentTagsController(req, res);

        // Assert
        expect(getAllTags).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument tags.',
          errors: ['Database error'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        getAllTags.mockRejectedValue(new Error('Server error'));

        // Act
        await getAllInstrumentTagsController(req, res);

        // Assert
        expect(getAllTags).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument tags.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the get instrument tag by ID controller
   */
  const testGetInstrumentTagController = () => {
    describe('getInstrumentTagController', () => {
      it('should get a tag by ID successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';

        getTagById.mockResolvedValue({
          success: true,
          data: sampleTag,
        });

        // Act
        await getInstrumentTagController(req, res);

        // Assert
        expect(getTagById).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: sampleTag,
        });
      });

      it('should return 404 if tag not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';

        getTagById.mockResolvedValue({
          success: false,
          errors: ['Tag not found'],
        });

        // Act
        await getInstrumentTagController(req, res);

        // Assert
        expect(getTagById).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument tag.',
          errors: ['Tag not found'],
        });
      });

      it('should return 400 for invalid ID format', async () => {
        // Arrange
        req.params.id = 'invalid-id-format';

        getTagById.mockResolvedValue({
          success: false,
          errors: ['Invalid tag ID format'],
        });

        // Act
        await getInstrumentTagController(req, res);

        // Assert
        expect(getTagById).toHaveBeenCalledWith('invalid-id-format');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument tag.',
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'mock-id';

        getTagById.mockRejectedValue(new Error('Server error'));

        // Act
        await getInstrumentTagController(req, res);

        // Assert
        expect(getTagById).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve instrument tag.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the update instrument tag controller
   */
  const testUpdateInstrumentTagController = () => {
    describe('updateInstrumentTagController', () => {
      it('should update a tag successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = {
          name: 'Updated Personality',
          description: 'Updated description',
        };

        const updatedTag = {
          ...sampleTag,
          name: 'Updated Personality',
          description: 'Updated description',
        };

        updateTag.mockResolvedValue({
          success: true,
          data: updatedTag,
        });

        // Act
        await updateInstrumentTagController(req, res);

        // Assert
        expect(updateTag).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: updatedTag,
        });
      });

      it('should return 404 if tag not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';
        req.body = {
          name: 'Updated Personality',
          description: 'Updated description',
        };

        updateTag.mockResolvedValue({
          success: false,
          errors: ['Tag not found'],
        });

        // Act
        await updateInstrumentTagController(req, res);

        // Assert
        expect(updateTag).toHaveBeenCalledWith('non-existent-id', req.body);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument tag.',
          errors: ['Tag not found'],
        });
      });

      it('should return 400 for validation errors', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = {
          // Missing name
          description: 'Updated description',
        };

        updateTag.mockResolvedValue({
          success: false,
          errors: ['Tag name is required'],
        });

        // Act
        await updateInstrumentTagController(req, res);

        // Assert
        expect(updateTag).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument tag.',
          errors: ['Tag name is required'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = {
          name: 'Updated Personality',
          description: 'Updated description',
        };

        updateTag.mockRejectedValue(new Error('Server error'));

        // Act
        await updateInstrumentTagController(req, res);

        // Assert
        expect(updateTag).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update instrument tag.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  /**
   * Test the delete instrument tag controller
   */
  const testDeleteInstrumentTagController = () => {
    describe('deleteInstrumentTagController', () => {
      it('should delete a tag successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';

        deleteTag.mockResolvedValue({
          success: true,
          data: sampleTag,
        });

        // Act
        await deleteInstrumentTagController(req, res);

        // Assert
        expect(deleteTag).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Instrument tag deleted successfully',
          data: sampleTag,
        });
      });

      it('should return 404 if tag not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';

        deleteTag.mockResolvedValue({
          success: false,
          errors: ['Tag not found'],
        });

        // Act
        await deleteInstrumentTagController(req, res);

        // Assert
        expect(deleteTag).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument tag.',
          errors: ['Tag not found'],
        });
      });

      it('should return 400 for invalid ID format', async () => {
        // Arrange
        req.params.id = 'invalid-id-format';

        deleteTag.mockResolvedValue({
          success: false,
          errors: ['Invalid tag ID format'],
        });

        // Act
        await deleteInstrumentTagController(req, res);

        // Assert
        expect(deleteTag).toHaveBeenCalledWith('invalid-id-format');
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument tag.',
          errors: ['Invalid tag ID format'],
        });
      });

      it('should handle server errors', async () => {
        // Arrange
        req.params.id = 'mock-id';

        deleteTag.mockRejectedValue(new Error('Server error'));

        // Act
        await deleteInstrumentTagController(req, res);

        // Assert
        expect(deleteTag).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete instrument tag.',
          errors: ['Internal server error'],
        });
      });
    });
  };

  // Run all test functions
  testCreateInstrumentTagController();
  testGetAllInstrumentTagsController();
  testGetInstrumentTagController();
  testUpdateInstrumentTagController();
  testDeleteInstrumentTagController();
});
