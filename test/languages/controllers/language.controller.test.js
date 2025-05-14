/**
 * Language Controller Tests
 * @module test/languages/controllers/language.controller.test
 */

const {
  createLanguageController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/languages/createLanguageController');
const {
  getAllLanguagesController,
} = require('../../../src/controllers/languages/getAllLanguagesController');
const {
  getLanguageByIdController,
} = require('../../../src/controllers/languages/getLanguageByIdController');
const {
  updateLanguageController,
} = require('../../../src/controllers/languages/updateLanguageController');
const {
  deleteLanguageController,
} = require('../../../src/controllers/languages/deleteLanguageController');

const {
  createLanguageService,
  getAllLanguagesService,
  getLanguageByIdService,
  updateLanguageService,
  deleteLanguageService,
} = require('../../../src/service/languageService');
const { validateLanguage } = require('../../../src/utils/languageValidator');

// Mock the service and validator functions
jest.mock('../../../src/service/languageService');
jest.mock('../../../src/utils/languageValidator');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the language controller functions
 */
describe('Language Controllers', () => {
  // Sample language data for testing
  const sampleLanguage = {
    _id: 'mock-id',
    name: 'JavaScript',
    designed_by: 'Brendan Eich',
    first_appeared: 1995,
    paradigm: ['event-driven', 'functional', 'imperative'],
    usage: 'Front-end web, back-end (Node.js), mobile apps',
    popularity_rank: 2,
    type_system: 'dynamic, weak',
    slug: 'javascript',
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
   * Test the create language controller
   */
  const testCreateLanguageController = () => {
    describe('createLanguageController', () => {
      it('should create a language successfully', async () => {
        // Arrange
        req.body = { ...sampleLanguage };
        delete req.body._id;
        delete req.body.slug;

        validateLanguage.mockReturnValue({ isValid: true });
        createLanguageService.mockResolvedValue(sampleLanguage);

        // Act
        await createLanguageController(req, res);

        // Assert
        expect(validateLanguage).toHaveBeenCalledWith(req.body);
        expect(createLanguageService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Language created successfully.',
          data: sampleLanguage,
        });
      });

      it('should return 400 if validation fails', async () => {
        // Arrange
        req.body = { name: 'Invalid Language' }; // Missing required fields
        const validationErrors = [
          'Designer information is required',
          'First appearance year is required',
        ];

        validateLanguage.mockReturnValue({ isValid: false, errors: validationErrors });

        // Act
        await createLanguageController(req, res);

        // Assert
        expect(validateLanguage).toHaveBeenCalledWith(req.body);
        expect(createLanguageService).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Invalid language data.',
          errors: validationErrors,
        });
      });

      it('should return 409 if language with same name already exists', async () => {
        // Arrange
        req.body = { ...sampleLanguage };
        delete req.body._id;

        validateLanguage.mockReturnValue({ isValid: true });
        createLanguageService.mockRejectedValue(
          new Error(`Language with name '${req.body.name}' already exists`)
        );

        // Act
        await createLanguageController(req, res);

        // Assert
        expect(validateLanguage).toHaveBeenCalledWith(req.body);
        expect(createLanguageService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: `Language with name '${req.body.name}' already exists`,
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        req.body = { ...sampleLanguage };
        delete req.body._id;

        validateLanguage.mockReturnValue({ isValid: true });
        createLanguageService.mockRejectedValue(new Error('Database error'));

        // Act
        await createLanguageController(req, res);

        // Assert
        expect(validateLanguage).toHaveBeenCalledWith(req.body);
        expect(createLanguageService).toHaveBeenCalledWith(req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to create language.',
          error: 'Database error',
        });
      });
    });
  };

  /**
   * Test the get all languages controller
   */
  const testGetAllLanguagesController = () => {
    describe('getAllLanguagesController', () => {
      it('should get all languages successfully', async () => {
        // Arrange
        const languages = [
          sampleLanguage,
          { ...sampleLanguage, _id: 'mock-id-2', name: 'Python', slug: 'python' },
        ];
        const totalCount = languages.length;

        getAllLanguagesService.mockResolvedValue({ languages, totalCount });

        // Act
        await getAllLanguagesController(req, res);

        // Assert
        expect(getAllLanguagesService).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: languages,
          pagination: {
            page: 1,
            total: totalCount,
            page_size: 10,
            total_pages: 1,
          },
        });
      });

      it('should apply query parameters', async () => {
        // Arrange
        req.query = {
          name: 'Java',
          page: '2',
          page_size: '5',
        };

        const languages = [sampleLanguage];
        const totalCount = 1;

        getAllLanguagesService.mockResolvedValue({ languages, totalCount });

        // Act
        await getAllLanguagesController(req, res);

        // Assert
        expect(getAllLanguagesService).toHaveBeenCalledWith(req.query);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: languages,
          pagination: {
            page: 2,
            page_size: 5,
            total: totalCount,
            total_pages: 1,
          },
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        getAllLanguagesService.mockRejectedValue(new Error('Database error'));

        // Act
        await getAllLanguagesController(req, res);

        // Assert
        expect(getAllLanguagesService).toHaveBeenCalledWith({});
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve languages.',
          error: 'Database error',
        });
      });
    });
  };

  /**
   * Test the get language by ID controller
   */
  const testGetLanguageByIdController = () => {
    describe('getLanguageByIdController', () => {
      it('should get a language by ID successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';
        getLanguageByIdService.mockResolvedValue(sampleLanguage);

        // Act
        await getLanguageByIdController(req, res);

        // Assert
        expect(getLanguageByIdService).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          data: sampleLanguage,
        });
      });

      it('should return 404 if language not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';
        getLanguageByIdService.mockResolvedValue(null);

        // Act
        await getLanguageByIdController(req, res);

        // Assert
        expect(getLanguageByIdService).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Language with ID non-existent-id not found.',
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        req.params.id = 'mock-id';
        getLanguageByIdService.mockRejectedValue(new Error('Database error'));

        // Act
        await getLanguageByIdController(req, res);

        // Assert
        expect(getLanguageByIdService).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to retrieve language.',
          error: 'Database error',
        });
      });
    });
  };

  /**
   * Test the update language controller
   */
  const testUpdateLanguageController = () => {
    describe('updateLanguageController', () => {
      it('should update a language successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = { usage: 'Updated usage' };

        const updatedLanguage = { ...sampleLanguage, usage: 'Updated usage' };
        validateLanguage.mockReturnValue({ isValid: true });
        updateLanguageService.mockResolvedValue(updatedLanguage);

        // Act
        await updateLanguageController(req, res);

        // Assert
        expect(validateLanguage).toHaveBeenCalledWith({ ...req.body, _id: 'mock-id' });
        expect(updateLanguageService).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Language updated successfully.',
          data: updatedLanguage,
        });
      });

      it('should return 400 if validation fails', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = { popularity_rank: 0 }; // Invalid: less than 1

        const validationErrors = ['Popularity rank must be a number greater than or equal to 1'];
        validateLanguage.mockReturnValue({ isValid: false, errors: validationErrors });
        getLanguageByIdService.mockResolvedValue(sampleLanguage);

        // Act
        await updateLanguageController(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Invalid language data.',
          errors: validationErrors,
        });
      });

      it('should return 404 if language not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';
        req.body = { usage: 'Updated usage' };

        validateLanguage.mockReturnValue({ isValid: true });
        updateLanguageService.mockResolvedValue(null);

        // Act
        await updateLanguageController(req, res);

        // Assert
        expect(updateLanguageService).toHaveBeenCalledWith('non-existent-id', req.body);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Language with ID non-existent-id not found.',
        });
      });

      it('should return 409 if updated name already exists', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = { name: 'Python' };

        validateLanguage.mockReturnValue({ isValid: true });
        updateLanguageService.mockRejectedValue(
          new Error(`Language with name 'Python' already exists`)
        );

        // Act
        await updateLanguageController(req, res);

        // Assert
        expect(updateLanguageService).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: `Language with name 'Python' already exists`,
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        req.params.id = 'mock-id';
        req.body = { usage: 'Updated usage' };

        validateLanguage.mockReturnValue({ isValid: true });
        updateLanguageService.mockRejectedValue(new Error('Database error'));

        // Act
        await updateLanguageController(req, res);

        // Assert
        expect(updateLanguageService).toHaveBeenCalledWith('mock-id', req.body);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to update language.',
          error: 'Database error',
        });
      });
    });
  };

  /**
   * Test the delete language controller
   */
  const testDeleteLanguageController = () => {
    describe('deleteLanguageController', () => {
      it('should delete a language successfully', async () => {
        // Arrange
        req.params.id = 'mock-id';
        deleteLanguageService.mockResolvedValue(true);

        // Act
        await deleteLanguageController(req, res);

        // Assert
        expect(deleteLanguageService).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          status: 'success',
          message: 'Language deleted successfully.',
        });
      });

      it('should return 404 if language not found', async () => {
        // Arrange
        req.params.id = 'non-existent-id';
        deleteLanguageService.mockResolvedValue(false);

        // Act
        await deleteLanguageController(req, res);

        // Assert
        expect(deleteLanguageService).toHaveBeenCalledWith('non-existent-id');
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Language with ID non-existent-id not found.',
        });
      });

      it('should return 500 for unexpected errors', async () => {
        // Arrange
        req.params.id = 'mock-id';
        deleteLanguageService.mockRejectedValue(new Error('Database error'));

        // Act
        await deleteLanguageController(req, res);

        // Assert
        expect(deleteLanguageService).toHaveBeenCalledWith('mock-id');
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
          status: 'error',
          message: 'Failed to delete language.',
          error: 'Database error',
        });
      });
    });
  };

  /**
   * Test response formatters
   */
  const testResponseFormatters = () => {
    describe('Response Formatters', () => {
      it('should format success response correctly', () => {
        // Act
        const result = formatSuccessResponse(sampleLanguage);

        // Assert
        expect(result).toEqual({
          status: 'success',
          message: 'Language created successfully.',
          data: sampleLanguage,
        });
      });

      it('should format error response correctly', () => {
        // Arrange
        const error = new Error('Test error');

        // Act
        const result = formatErrorResponse(error);

        // Assert
        expect(result).toEqual({
          status: 'error',
          message: 'Failed to create language.',
          error: 'Test error',
        });
      });
    });
  };

  // Run all test functions
  testCreateLanguageController();
  testGetAllLanguagesController();
  testGetLanguageByIdController();
  testUpdateLanguageController();
  testDeleteLanguageController();
  testResponseFormatters();
});
