/**
 * Language Routes Tests
 * @module test/languages/routes/language.routes.test
 */

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Import controllers
const {
  getAllLanguagesController,
  getLanguageByIdController,
  createLanguageController,
  updateLanguageController,
  deleteLanguageController,
} = require('../../../src/controllers/languages');

// Mock the controllers
jest.mock('../../../src/controllers/languages');
jest.mock('../../../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
}));

/**
 * Test the language routes
 */
describe('Language Routes', () => {
  let app;
  let mongoServer;

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

  // Setup Express app and MongoDB Memory Server before tests
  beforeAll(async () => {
    // Setup MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    // Setup Express app
    app = express();
    app.use(express.json());

    // Mount language routes
    const languageRoutes = require('../../../src/routes/languages');
    app.use('/api/languages', languageRoutes);
  });

  // Clean up after tests
  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    getAllLanguagesController.mockImplementation((req, res) => {
      res.status(200).json({
        status: 'success',
        message: 'Languages retrieved successfully.',
        data: {
          languages: [sampleLanguage],
          totalCount: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });

    getLanguageByIdController.mockImplementation((req, res) => {
      if (req.params.id === 'mock-id') {
        res.status(200).json({
          status: 'success',
          message: 'Language retrieved successfully.',
          data: sampleLanguage,
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Language not found.',
        });
      }
    });

    createLanguageController.mockImplementation((req, res) => {
      res.status(201).json({
        status: 'success',
        message: 'Language created successfully.',
        data: { ...req.body, _id: 'new-mock-id' },
      });
    });

    updateLanguageController.mockImplementation((req, res) => {
      if (req.params.id === 'mock-id') {
        res.status(200).json({
          status: 'success',
          message: 'Language updated successfully.',
          data: { ...sampleLanguage, ...req.body },
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Language not found.',
        });
      }
    });

    deleteLanguageController.mockImplementation((req, res) => {
      if (req.params.id === 'mock-id') {
        res.status(200).json({
          status: 'success',
          message: 'Language deleted successfully.',
        });
      } else {
        res.status(404).json({
          status: 'error',
          message: 'Language not found.',
        });
      }
    });
  });

  /**
   * Test GET /api/languages endpoint
   */
  const testGetAllLanguagesRoute = () => {
    describe('GET /api/languages', () => {
      it('should return all languages', async () => {
        // Act
        const response = await request(app).get('/api/languages');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Languages retrieved successfully.');
        expect(response.body.data.languages).toHaveLength(1);
        expect(response.body.data.languages[0]).toEqual(sampleLanguage);
        expect(getAllLanguagesController).toHaveBeenCalled();
      });

      it('should accept query parameters', async () => {
        // Act
        const response = await request(app).get('/api/languages').query({
          name: 'Java',
          page: 2,
          limit: 5,
        });

        // Assert
        expect(response.status).toBe(200);
        expect(getAllLanguagesController).toHaveBeenCalled();
        // The controller should receive the query parameters
        const controllerCall = getAllLanguagesController.mock.calls[0][0];
        expect(controllerCall.query).toEqual({
          name: 'Java',
          page: '2',
          limit: '5',
        });
      });
    });
  };

  /**
   * Test GET /api/languages/:id endpoint
   */
  const testGetLanguageByIdRoute = () => {
    describe('GET /api/languages/:id', () => {
      it('should return a language by ID', async () => {
        // Act
        const response = await request(app).get('/api/languages/mock-id');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Language retrieved successfully.');
        expect(response.body.data).toEqual(sampleLanguage);
        expect(getLanguageByIdController).toHaveBeenCalled();
      });

      it('should return 404 if language not found', async () => {
        // Act
        const response = await request(app).get('/api/languages/non-existent-id');

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Language not found.');
        expect(getLanguageByIdController).toHaveBeenCalled();
      });
    });
  };

  /**
   * Test POST /api/languages endpoint
   */
  const testCreateLanguageRoute = () => {
    describe('POST /api/languages', () => {
      it('should create a new language', async () => {
        // Arrange
        const newLanguage = {
          name: 'Python',
          designed_by: 'Guido van Rossum',
          first_appeared: 1991,
          paradigm: ['object-oriented', 'imperative', 'functional', 'procedural'],
          usage: 'AI, data science, web development, scripting',
          popularity_rank: 1,
          type_system: 'dynamic, strong',
        };

        // Act
        const response = await request(app).post('/api/languages').send(newLanguage);

        // Assert
        expect(response.status).toBe(201);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Language created successfully.');
        expect(response.body.data).toEqual({ ...newLanguage, _id: 'new-mock-id' });
        expect(createLanguageController).toHaveBeenCalled();

        // Verify the controller received the correct data
        const controllerCall = createLanguageController.mock.calls[0][0];
        expect(controllerCall.body).toEqual(newLanguage);
      });

      it('should handle validation errors', async () => {
        // Arrange
        createLanguageController.mockImplementation((req, res) => {
          res.status(400).json({
            status: 'error',
            message: 'Invalid language data.',
            errors: ['Language name is required'],
          });
        });

        // Act
        const response = await request(app).post('/api/languages').send({ designed_by: 'Test' }); // Missing required fields

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Invalid language data.');
        expect(response.body.errors).toContain('Language name is required');
        expect(createLanguageController).toHaveBeenCalled();
      });
    });
  };

  /**
   * Test PUT /api/languages/:id endpoint
   */
  const testUpdateLanguageRoute = () => {
    describe('PUT /api/languages/:id', () => {
      it('should update an existing language', async () => {
        // Arrange
        const updateData = {
          usage: 'Updated usage information',
          popularity_rank: 3,
        };

        // Act
        const response = await request(app).put('/api/languages/mock-id').send(updateData);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Language updated successfully.');
        expect(response.body.data).toEqual({ ...sampleLanguage, ...updateData });
        expect(updateLanguageController).toHaveBeenCalled();

        // Verify the controller received the correct data
        const controllerCall = updateLanguageController.mock.calls[0][0];
        expect(controllerCall.params.id).toBe('mock-id');
        expect(controllerCall.body).toEqual(updateData);
      });

      it('should return 404 if language not found', async () => {
        // Act
        const response = await request(app)
          .put('/api/languages/non-existent-id')
          .send({ usage: 'Updated usage' });

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Language not found.');
        expect(updateLanguageController).toHaveBeenCalled();
      });
    });
  };

  /**
   * Test DELETE /api/languages/:id endpoint
   */
  const testDeleteLanguageRoute = () => {
    describe('DELETE /api/languages/:id', () => {
      it('should delete an existing language', async () => {
        // Act
        const response = await request(app).delete('/api/languages/mock-id');

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');
        expect(response.body.message).toBe('Language deleted successfully.');
        expect(deleteLanguageController).toHaveBeenCalled();

        // Verify the controller received the correct ID
        const controllerCall = deleteLanguageController.mock.calls[0][0];
        expect(controllerCall.params.id).toBe('mock-id');
      });

      it('should return 404 if language not found', async () => {
        // Act
        const response = await request(app).delete('/api/languages/non-existent-id');

        // Assert
        expect(response.status).toBe(404);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Language not found.');
        expect(deleteLanguageController).toHaveBeenCalled();
      });
    });
  };

  /**
   * Test error handling for routes
   */
  const testErrorHandling = () => {
    describe('Error Handling', () => {
      it('should handle server errors in GET /api/languages', async () => {
        // Arrange
        getAllLanguagesController.mockImplementation((req, res) => {
          res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve languages.',
            error: 'Database error',
          });
        });

        // Act
        const response = await request(app).get('/api/languages');

        // Assert
        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to retrieve languages.');
        expect(response.body.error).toBe('Database error');
      });

      it('should handle server errors in POST /api/languages', async () => {
        // Arrange
        createLanguageController.mockImplementation((req, res) => {
          res.status(500).json({
            status: 'error',
            message: 'Failed to create language.',
            error: 'Database error',
          });
        });

        // Act
        const response = await request(app).post('/api/languages').send(sampleLanguage);

        // Assert
        expect(response.status).toBe(500);
        expect(response.body.status).toBe('error');
        expect(response.body.message).toBe('Failed to create language.');
        expect(response.body.error).toBe('Database error');
      });
    });
  };

  // Run all test functions
  testGetAllLanguagesRoute();
  testGetLanguageByIdRoute();
  testCreateLanguageRoute();
  testUpdateLanguageRoute();
  testDeleteLanguageRoute();
  testErrorHandling();
});
