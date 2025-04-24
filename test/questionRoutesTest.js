/**
 * Tests for the question generation routes
 */

const request = require('supertest');
const { app, initializeApp } = require('../src/index');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Mock the Gemini AI service
jest.mock('../src/service/gemini/quizQuestionCreator', () => {
  const originalModule = jest.requireActual('../src/service/gemini/quizQuestionCreator');

  return {
    ...originalModule,
    generateQuizQuestions: jest.fn(),
  };
});

// Import the mocked module
const { generateQuizQuestions } = require('../src/service/gemini/quizQuestionCreator');

describe('Question Routes', () => {
  let server;
  let tempDir;

  beforeAll(async () => {
    // Create a temporary directory for test files
    tempDir = path.join(os.tmpdir(), `question-routes-test-${Date.now()}`);
    await fs.mkdir(tempDir, { recursive: true });

    // Set environment variables for testing
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'test-model';
    process.env.GEMINI_TMP_DIR = tempDir;

    // This might take some time due to MongoDB connection
    jest.setTimeout(10000);
    const result = await initializeApp();
    server = result.server;
  });

  afterAll(async () => {
    // Close the server
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }

    // Close the MongoDB connection
    const { closeConnection } = require('../src/repository/baseRepository');
    await closeConnection();

    // Clean up temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to clean up temp directory: ${error.message}`);
    }
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.resetAllMocks();
  });

  describe('POST /api/questions/generate', () => {
    it('should validate required fields', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        // Missing required fields
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should validate position value', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript',
        language: 'JavaScript',
        position: 'invalid_position', // Invalid: not in the allowed list
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain(
        'Position must be one of: intern, fresher, junior, middle, senior, expert'
      );
    });

    it('should generate questions successfully', async () => {
      // Mock the generateQuizQuestions function to return sample questions
      const mockQuestions = [
        {
          question: 'What method is used to add elements to the end of an array in JavaScript?',
          options: ['push()', 'append()', 'addToEnd()', 'insert()'],
          correctAnswer: 0,
          explanation:
            'The push() method adds one or more elements to the end of an array and returns the new length of the array.',
          difficulty: 'easy',
          category: 'JavaScript Arrays',
        },
        {
          question: 'Which array method removes the last element from an array?',
          options: ['pop()', 'removeLast()', 'delete()', 'splice()'],
          correctAnswer: 0,
          explanation:
            'The pop() method removes the last element from an array and returns that element.',
          difficulty: 'easy',
          category: 'JavaScript Arrays',
        },
      ];

      // Setup the mock to return our sample questions
      generateQuizQuestions.mockResolvedValue({
        questions: mockQuestions,
        filePath: path.join(tempDir, 'test-questions.json'),
      });

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the mock was called with correct parameters
      expect(generateQuizQuestions).toHaveBeenCalledWith(
        expect.any(String), // path to existing questions
        expect.objectContaining({
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'junior',
          difficultyText: 'practical application of programming concepts',
          positionInstruction: 'targeted at a junior developer with some experience',
        })
      );

      // Verify the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBe(2);

      // Check the structure of the first question
      const firstQuestion = response.body.data[0];
      expect(firstQuestion).toHaveProperty('question');
      expect(firstQuestion).toHaveProperty('options');
      expect(firstQuestion.options).toBeInstanceOf(Array);
      expect(firstQuestion.options.length).toBe(4);
      expect(firstQuestion).toHaveProperty('correctAnswer');
      expect(firstQuestion).toHaveProperty('explanation');
      expect(firstQuestion).toHaveProperty('difficulty');
      expect(firstQuestion).toHaveProperty('category');
      expect(firstQuestion).toHaveProperty('topic');
      expect(firstQuestion).toHaveProperty('language');
      expect(firstQuestion).toHaveProperty('position');
      expect(firstQuestion).toHaveProperty('positionLevel');
      expect(firstQuestion).toHaveProperty('createdAt');
    });

    it('should handle AI service errors', async () => {
      // Mock the generateQuizQuestions function to throw an error
      generateQuizQuestions.mockRejectedValue(
        new Error('Failed to generate content from Gemini API: API error')
      );

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(502);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Failed to generate questions from AI.');
    });
  });
});
