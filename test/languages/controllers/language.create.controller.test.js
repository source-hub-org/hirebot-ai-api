/**
 * Language Create Controller Tests
 * @module test/languages/controllers/language.create.controller.test
 */

const {
  createLanguageController,
  formatSuccessResponse,
  formatErrorResponse,
} = require('../../../src/controllers/languages/createLanguageController');
const { createLanguageService } = require('../../../src/service/languageService');
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
 * Test the create language controller
 */
describe('Create Language Controller', () => {
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
  };

  /**
   * Test response formatters
   */
  const testResponseFormatters = () => {
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
  };

  // Run all test functions
  testCreateLanguageController();
  testResponseFormatters();
});
