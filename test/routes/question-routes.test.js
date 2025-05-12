/**
 * Tests for the question generation routes
 */

const request = require('supertest');
const { app, initializeApp } = require('../../src/index');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

// Mock the Gemini AI service
jest.mock('../../src/service/gemini/quizQuestionCreator', () => {
  const originalModule = jest.requireActual('../../src/service/gemini/quizQuestionCreator');

  return {
    ...originalModule,
    generateQuizQuestions: jest.fn(),
  };
});

// Mock the question generation service
jest.mock('../../src/service/questionGenerationService', () => {
  return {
    generateAndStoreQuestions: jest.fn(),
    generateQuestions: jest.fn(),
  };
});

// Mock the repository module
jest.mock('../../src/repository/baseRepository', () => {
  const originalModule = jest.requireActual('../../src/repository/baseRepository');

  return {
    ...originalModule,
    insertMany: jest.fn(),
  };
});

// Mock the position utils module
jest.mock('../../src/utils/positionUtils', () => {
  const originalModule = jest.requireActual('../../src/utils/positionUtils');

  return {
    ...originalModule,
    getPositionMetadata: jest.fn().mockImplementation(async position => {
      // Return test values that match what the tests expect
      const positionMap = {
        intern: {
          difficultyText: 'basic understanding of programming concepts',
          positionInstruction: 'suitable for an intern-level candidate',
          positionLevel: 1,
        },
        fresher: {
          difficultyText: 'fundamental programming knowledge',
          positionInstruction: 'appropriate for a fresher with limited experience',
          positionLevel: 2,
        },
        junior: {
          difficultyText: 'practical application of programming concepts',
          positionInstruction: 'targeted at a junior developer with some experience',
          positionLevel: 3,
        },
        middle: {
          difficultyText: 'intermediate understanding of software development',
          positionInstruction: 'designed for a mid-level developer with solid experience',
          positionLevel: 4,
        },
        senior: {
          difficultyText: 'deep understanding of scalable systems and best practices',
          positionInstruction: 'targeted at a senior developer with extensive experience',
          positionLevel: 5,
        },
        expert: {
          difficultyText: 'advanced architectural thinking and system design expertise',
          positionInstruction: 'challenging for expert-level developers and architects',
          positionLevel: 6,
        },
      };

      return (
        positionMap[position] || {
          difficultyText: 'various difficulty levels',
          positionInstruction: 'suitable for developers of different experience levels',
          positionLevel: 3,
        }
      );
    }),
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
const { generateQuizQuestions } = require('../../src/service/gemini/quizQuestionCreator');
const { generateAndStoreQuestions } = require('../../src/service/questionGenerationService');
const { insertMany } = require('../../src/repository/baseRepository');

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
    const { closeConnection } = require('../../src/repository/baseRepository');
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

    // Default mock implementation for generateAndStoreQuestions
    generateAndStoreQuestions.mockImplementation(async params => {
      const { position } = params;
      const positionLevel =
        position === 'intern'
          ? 1
          : position === 'fresher'
            ? 2
            : position === 'junior'
              ? 3
              : position === 'middle'
                ? 4
                : position === 'senior'
                  ? 5
                  : position === 'expert'
                    ? 6
                    : 3;

      const formattedPosition = position.charAt(0).toUpperCase() + position.slice(1);

      return [
        {
          question: `Sample ${position} question`,
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Sample explanation',
          difficulty: 'medium',
          category: 'Sample Category',
          position: formattedPosition,
          positionLevel: positionLevel,
        },
      ];
    });
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

      // The validation now properly handles arrays and returns 400 instead of 500
      expect(response.status).toBe(400);
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

    positionTests.forEach(({ position, level }) => {
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

        // Verify the mock was called with correct parameters
        expect(generateAndStoreQuestions).toHaveBeenCalledWith(
          expect.objectContaining({
            position: position,
          })
        );
      });
    });

    // Test for successful question generation
    it('should generate questions successfully', async () => {
      // Mock the generateAndStoreQuestions function to return sample questions
      const mockQuestions = [
        {
          question: 'What method is used to add elements to the end of an array in JavaScript?',
          options: ['push()', 'append()', 'addToEnd()', 'insert()'],
          correctAnswer: 0,
          explanation:
            'The push() method adds one or more elements to the end of an array and returns the new length of the array.',
          difficulty: 'easy',
          category: 'JavaScript Arrays',
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'Junior',
          positionLevel: 3,
          createdAt: new Date(),
        },
        {
          question: 'Which array method removes the last element from an array?',
          options: ['pop()', 'removeLast()', 'delete()', 'splice()'],
          correctAnswer: 0,
          explanation:
            'The pop() method removes the last element from an array and returns that element.',
          difficulty: 'easy',
          category: 'JavaScript Arrays',
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'Junior',
          positionLevel: 3,
          createdAt: new Date(),
        },
      ];

      // Setup the mock to return our sample questions
      generateAndStoreQuestions.mockResolvedValue(mockQuestions);

      // Make the request
      const response = await request(app).post('/api/questions/generate').send({
        topic: 'JavaScript Arrays',
        language: 'JavaScript',
        position: 'junior',
      });

      // Verify the mock was called with correct parameters
      expect(generateAndStoreQuestions).toHaveBeenCalledWith(
        expect.objectContaining({
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'junior',
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

      // We don't need to verify database insertion here since it's handled inside generateAndStoreQuestions
      // which we've already mocked
    });

    // Test for AI service errors
    it('should handle AI service errors', async () => {
      // Mock the generateAndStoreQuestions function to throw an error
      generateAndStoreQuestions.mockRejectedValue(
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
      // Mock the generateAndStoreQuestions function to throw a parsing error
      generateAndStoreQuestions.mockRejectedValue(
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
      // Mock generateAndStoreQuestions to throw a database error
      generateAndStoreQuestions.mockRejectedValue(
        new Error('Database error: MongoDB connection error: Failed to insert documents')
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
      // Mock successful question generation
      const mockQuestions = [
        {
          question: 'Sample question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 0,
          explanation: 'Sample explanation',
          difficulty: 'easy',
          category: 'Sample Category',
          topic: 'JavaScript Arrays',
          language: 'JavaScript',
          position: 'Junior',
          positionLevel: 3,
          createdAt: new Date(),
        },
      ];

      generateAndStoreQuestions.mockResolvedValue(mockQuestions);

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
      generateAndStoreQuestions.mockRejectedValue(new Error('Unexpected error occurred'));

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
