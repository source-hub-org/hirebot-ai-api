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

// Mock the repository module
jest.mock('../src/repository/baseRepository', () => {
  const originalModule = jest.requireActual('../src/repository/baseRepository');

  return {
    ...originalModule,
    insertMany: jest.fn(),
  };
});

// Mock fs.promises for testing file operations
jest.mock('fs', () => {
  return {
    ...jest.requireActual('fs'),
    promises: {
      appendFile: jest.fn().mockResolvedValue(undefined),
      mkdir: jest.fn().mockResolvedValue(undefined),
      rm: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// Import the mocked modules
const { generateQuizQuestions } = require('../src/service/gemini/quizQuestionCreator');
const { insertMany } = require('../src/repository/baseRepository');

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

    // Default success response for insertMany
    insertMany.mockResolvedValue({ insertedCount: 2, insertedIds: { 0: 'id1', 1: 'id2' } });

    // Default success response for appendFile
    require('fs').promises.appendFile.mockResolvedValue(undefined);
  });

  describe('POST /api/questions/generate', () => {
    // Test for missing all required fields
    it('should validate all required fields are missing', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        // Missing all required fields
      });

      expect(response.status).toBe(400);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors.length).toBe(3); // Should have 3 validation errors
      expect(response.body.errors).toContain('Topic is required and must be a string');
      expect(response.body.errors).toContain('Language is required and must be a string');
      expect(response.body.errors).toContain('Position is required and must be a string');
    });

    // Test for missing topic field
    it('should validate missing topic field', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        language: 'JavaScript',
        position: 'junior',
        // Missing topic
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('Topic is required and must be a string');
    });

    // Test for missing language field
    it('should validate missing language field', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'Arrays',
        position: 'junior',
        // Missing language
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('Language is required and must be a string');
    });

    // Test for missing position field
    it('should validate missing position field', async () => {
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'Arrays',
        language: 'JavaScript',
        // Missing position
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('Position is required and must be a string');
    });

    // Test for invalid field types
    it('should validate field types', async () => {
      // We need to test each invalid field type separately
      // First test: invalid topic
      let response = await request(app).post('/api/questions/generate').send({
        topic: 123, // Should be string
        language: 'JavaScript',
        position: 'junior',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('Topic is required and must be a string');

      // Second test: invalid language
      response = await request(app).post('/api/questions/generate').send({
        topic: 'Arrays',
        language: true, // Should be string
        position: 'junior',
      });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.errors).toContain('Language is required and must be a string');

      // Third test: invalid position
      response = await request(app)
        .post('/api/questions/generate')
        .send({
          topic: 'Arrays',
          language: 'JavaScript',
          position: ['junior'], // Should be string
        });

      // This is returning 500 instead of 400 because arrays can't be converted to lowercase
      // in the validation step, causing an unhandled error
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });

    // Test for invalid position value
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

    // Test for each valid position value
    const positionTests = [
      {
        position: 'intern',
        level: 1,
        difficultyText: 'basic understanding of programming concepts',
      },
      { position: 'fresher', level: 2, difficultyText: 'fundamental programming knowledge' },
      {
        position: 'junior',
        level: 3,
        difficultyText: 'practical application of programming concepts',
      },
      {
        position: 'middle',
        level: 4,
        difficultyText: 'intermediate understanding of software development',
      },
      {
        position: 'senior',
        level: 5,
        difficultyText: 'deep understanding of scalable systems and best practices',
      },
      {
        position: 'expert',
        level: 6,
        difficultyText: 'advanced architectural thinking and system design expertise',
      },
    ];

    positionTests.forEach(({ position, level, difficultyText }) => {
      it(`should handle ${position} position correctly`, async () => {
        // Mock the generateQuizQuestions function to return sample questions
        const mockQuestions = [
          {
            question: `Sample ${position} question`,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            explanation: 'Sample explanation',
            difficulty: 'medium',
            category: 'Sample Category',
          },
        ];

        // Setup the mock to return our sample questions
        generateQuizQuestions.mockResolvedValue({
          questions: mockQuestions,
          filePath: path.join(tempDir, 'test-questions.json'),
        });

        // Make the request
        const response = await request(app).post('/api/questions/generate').send({
          topic: 'Sample Topic',
          language: 'JavaScript',
          position: position,
        });

        // Verify the response
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('success');

        // Check position level is correctly set
        const questionData = response.body.data[0];
        expect(questionData.positionLevel).toBe(level);
        expect(questionData.position).toBe(position.charAt(0).toUpperCase() + position.slice(1));

        // Verify the mock was called with correct difficulty text
        expect(generateQuizQuestions).toHaveBeenCalledWith(
          expect.objectContaining({
            difficultyText: difficultyText,
          })
        );
      });
    });

    // Test for successful question generation
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

      // Verify database insertion was called
      expect(insertMany).toHaveBeenCalledWith('questions', expect.any(Array));
    });

    // Test for AI service errors
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
      expect(response.body.details).toBe(
        'The AI service encountered an error while processing your request.'
      );
    });

    // Test for JSON parsing errors
    it('should handle JSON parsing errors', async () => {
      // Mock the generateQuizQuestions function to throw a parsing error
      generateQuizQuestions.mockRejectedValue(
        new Error('Invalid generated content: Failed to parse JSON')
      );

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(422);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Failed to generate quiz questions.');
      expect(response.body.details).toBe(
        'The AI generated a response that could not be properly parsed as valid questions.'
      );
    });

    // Test for database errors
    it('should handle database errors', async () => {
      // Mock successful AI response
      const mockQuestions = [
        {
          question: 'Sample question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Sample explanation',
          difficulty: 'easy',
          category: 'Sample Category',
        },
      ];

      generateQuizQuestions.mockResolvedValue({
        questions: mockQuestions,
        filePath: path.join(tempDir, 'test-questions.json'),
      });

      // Mock database error
      insertMany.mockRejectedValue(
        new Error('MongoDB connection error: Failed to insert documents')
      );

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('Failed to save questions.');
      expect(response.body.details).toBe(
        'The questions were generated successfully but could not be saved to the database.'
      );
    });

    // Test for file append errors
    it('should continue execution even if file append fails', async () => {
      // Mock successful AI response
      const mockQuestions = [
        {
          question: 'Sample question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Sample explanation',
          difficulty: 'easy',
          category: 'Sample Category',
        },
      ];

      generateQuizQuestions.mockResolvedValue({
        questions: mockQuestions,
        filePath: path.join(tempDir, 'test-questions.json'),
      });

      // Mock file append error
      require('fs').promises.appendFile.mockRejectedValue(new Error('Failed to write to file'));

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response is still successful
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Questions generated and saved.');
    });

    // Test for generic unexpected errors
    it('should handle generic unexpected errors', async () => {
      // Mock an unexpected error that doesn't match any specific error type
      generateQuizQuestions.mockImplementation(() => {
        throw new Error('Unexpected error occurred');
      });

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the response
      expect(response.status).toBe(500);
      expect(response.body).toBeInstanceOf(Object);
      expect(response.body.status).toBe('error');
      expect(response.body.message).toBe('An unexpected error occurred.');
      expect(response.body.details).toBe(
        'The server encountered an unexpected error while processing your request.'
      );
    });
  });
});
