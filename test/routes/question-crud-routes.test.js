/**
 * Tests for the question CRUD routes
 * @module test/routes/question-crud-routes.test
 */

const request = require('supertest');
const express = require('express');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');
const { initializeDb, closeConnection } = require('../../src/repository/baseRepository');
const {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
} = require('../../src/repository/questionRepository');

// Mock dependencies
jest.mock('../../src/repository/questionRepository');

// Mock the routes module
jest.mock('../../src/routes/questions/questionRoutes', () => {
  const express = require('express');
  const {
    createQuestionController,
    getQuestionController,
    updateQuestionController,
    deleteQuestionController,
  } = require('../../src/controllers/questions/questionController');

  const router = express.Router();

  router.post('/', createQuestionController);
  router.get('/:id', getQuestionController);
  router.put('/:id', updateQuestionController);
  router.delete('/:id', deleteQuestionController);

  return router;
});

describe('Question CRUD Routes Tests', () => {
  let app;
  let mongoServer;
  let mongoUri;

  // Sample question for testing
  const sampleQuestion = {
    _id: new ObjectId().toString(),
    question: 'What is a closure in JavaScript?',
    options: [
      'A function that returns another function',
      'A variable that cannot be changed',
      'A function with access to its outer scope',
      'A method to close a connection',
    ],
    correctAnswer: 2,
    explanation: 'A closure is a function that has access to variables from its outer scope.',
    difficulty: 'medium',
    category: 'JavaScript Concepts',
    topic: 'JavaScript',
    language: 'JavaScript',
    position: 'Junior',
    positionLevel: 2,
    createdAt: new Date().toISOString(),
  };

  // Set up Express app and MongoDB before all tests
  beforeAll(async () => {
    // Set up Express app
    app = express();
    app.use(express.json());

    // Import the mocked routes
    const questionRoutes = require('../../src/routes/questions/questionRoutes');
    app.use('/api/questions', questionRoutes);

    // Set up in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    mongoUri = mongoServer.getUri();
    await initializeDb(mongoUri, 'hirebot_db_test');
  });

  // Close connections after all tests
  afterAll(async () => {
    await closeConnection();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /api/questions', () => {
    test('should create a new question successfully', async () => {
      // Mock repository to return the created question
      createQuestion.mockResolvedValue(sampleQuestion);

      // Create a new question without the _id field
      const newQuestion = { ...sampleQuestion };
      delete newQuestion._id;

      // Make request
      const response = await request(app).post('/api/questions').send(newQuestion);

      // Verify response
      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Question created successfully');
      expect(response.body.data).toEqual(sampleQuestion);
      expect(createQuestion).toHaveBeenCalledWith(expect.objectContaining(newQuestion));
    });

    test('should return validation error for invalid question data', async () => {
      // Create an invalid question (missing required fields)
      const invalidQuestion = {
        question: 'What is a closure in JavaScript?',
        // Missing options, correctAnswer, etc.
      };

      // Make request
      const response = await request(app).post('/api/questions').send(invalidQuestion);

      // Verify response
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
      expect(createQuestion).not.toHaveBeenCalled();
    });

    test('should handle database errors during creation', async () => {
      // Mock repository to throw error
      createQuestion.mockRejectedValue(new Error('Database error'));

      // Create a new question without the _id field
      const newQuestion = { ...sampleQuestion };
      delete newQuestion._id;

      // Make request
      const response = await request(app).post('/api/questions').send(newQuestion);

      // Verify response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while creating the question');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('GET /api/questions/:id', () => {
    test('should get a question by ID successfully', async () => {
      // Mock repository to return the sample question
      getQuestionById.mockResolvedValue(sampleQuestion);

      // Make request
      const response = await request(app).get(`/api/questions/${sampleQuestion._id}`);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Question retrieved successfully');
      expect(response.body.data).toEqual(sampleQuestion);
      expect(getQuestionById).toHaveBeenCalledWith(sampleQuestion._id);
    });

    test('should return 404 when question is not found', async () => {
      // Mock repository to return null (question not found)
      getQuestionById.mockResolvedValue(null);

      const nonExistentId = new ObjectId().toString();

      // Make request
      const response = await request(app).get(`/api/questions/${nonExistentId}`);

      // Verify response
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(`Question with ID ${nonExistentId} not found`);
      expect(getQuestionById).toHaveBeenCalledWith(nonExistentId);
    });

    test('should handle database errors during retrieval', async () => {
      // Mock repository to throw error
      getQuestionById.mockRejectedValue(new Error('Database error'));

      // Make request
      const response = await request(app).get(`/api/questions/${sampleQuestion._id}`);

      // Verify response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while retrieving the question');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /api/questions/:id', () => {
    test('should update a question successfully', async () => {
      // Create an updated question
      const updatedQuestion = {
        ...sampleQuestion,
        question: 'Updated question text',
        explanation: 'Updated explanation',
      };

      // Mock repository to return the updated question
      updateQuestionById.mockResolvedValue(updatedQuestion);

      // Make request
      const response = await request(app)
        .put(`/api/questions/${sampleQuestion._id}`)
        .send(updatedQuestion);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Question updated successfully');
      expect(response.body.data).toEqual(updatedQuestion);
      expect(updateQuestionById).toHaveBeenCalledWith(
        sampleQuestion._id,
        expect.objectContaining({
          question: 'Updated question text',
          explanation: 'Updated explanation',
        })
      );
    });

    test('should return validation error for invalid update data', async () => {
      // Create invalid update data
      const invalidUpdate = {
        question: 'Updated question text',
        correctAnswer: 5, // Invalid: should be between 0-3
      };

      // Make request
      const response = await request(app)
        .put(`/api/questions/${sampleQuestion._id}`)
        .send(invalidUpdate);

      // Verify response
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(updateQuestionById).not.toHaveBeenCalled();
    });

    test('should return 404 when updating non-existent question', async () => {
      // Mock repository to return null (question not found)
      updateQuestionById.mockResolvedValue(null);

      const nonExistentId = new ObjectId().toString();

      // Make request with valid update data
      const response = await request(app)
        .put(`/api/questions/${nonExistentId}`)
        .send(sampleQuestion);

      // Verify response
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(`Question with ID ${nonExistentId} not found`);
    });

    test('should handle database errors during update', async () => {
      // Mock repository to throw error
      updateQuestionById.mockRejectedValue(new Error('Database error'));

      // Make request
      const response = await request(app)
        .put(`/api/questions/${sampleQuestion._id}`)
        .send(sampleQuestion);

      // Verify response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while updating the question');
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('DELETE /api/questions/:id', () => {
    test('should delete a question successfully', async () => {
      // Mock repository to return true (successful deletion)
      deleteQuestionById.mockResolvedValue(true);

      // Make request
      const response = await request(app).delete(`/api/questions/${sampleQuestion._id}`);

      // Verify response
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Question deleted successfully');
      expect(response.body.data).toEqual({ success: true });
      expect(deleteQuestionById).toHaveBeenCalledWith(sampleQuestion._id);
    });

    test('should return 404 when deleting non-existent question', async () => {
      // Mock repository to return false (question not found)
      deleteQuestionById.mockResolvedValue(false);

      const nonExistentId = new ObjectId().toString();

      // Make request
      const response = await request(app).delete(`/api/questions/${nonExistentId}`);

      // Verify response
      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe(`Question with ID ${nonExistentId} not found`);
    });

    test('should handle database errors during deletion', async () => {
      // Mock repository to throw error
      deleteQuestionById.mockRejectedValue(new Error('Database error'));

      // Make request
      const response = await request(app).delete(`/api/questions/${sampleQuestion._id}`);

      // Verify response
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An error occurred while deleting the question');
      expect(response.body.error).toBe('Database error');
    });
  });
});
