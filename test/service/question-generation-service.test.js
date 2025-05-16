/**
 * Tests for the Question Generation Service
 */

const { ObjectId } = require('mongodb');

// Mock the Gemini service
jest.mock('../../src/services/gemini/quizQuestionCreator', () => ({
  generateQuizQuestions: jest.fn(),
}));

// Mock the repository
jest.mock('../../src/repository/baseRepository', () => ({
  insertMany: jest.fn(),
}));

// Mock the utility functions
jest.mock('../../src/utils/positionUtils', () => ({
  getPositionMetadata: jest.fn(),
  formatPositionForDisplay: jest.fn(),
}));

// Mock the logger
jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('questionGenerationService', () => {
  let geminiService;
  let baseRepository;
  let positionUtils;
  let questionGenerationService;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Get the mocked modules
    geminiService = require('../../src/services/gemini/quizQuestionCreator');
    baseRepository = require('../../src/repository/baseRepository');
    positionUtils = require('../../src/utils/positionUtils');
    logger = require('../../src/utils/logger');

    // Import the module under test
    questionGenerationService = require('../../src/services/questionGenerationService');
  });

  describe('generateQuestions', () => {
    test('should generate questions using AI', async () => {
      // Setup mock data
      const mockParams = {
        topic: 'JavaScript',
        language: 'TypeScript',
        position: 'Senior',
      };

      const mockPositionMetadata = {
        difficultyText: 'deep understanding of scalable systems',
        positionInstruction: 'targeted at a senior developer',
        positionLevel: 5,
      };

      const mockGeneratedQuestions = {
        questions: [
          {
            question: 'What is TypeScript?',
            options: ['A', 'B', 'C', 'D'],
            answer: 0,
          },
          {
            question: 'What are generics in TypeScript?',
            options: ['A', 'B', 'C', 'D'],
            answer: 1,
          },
        ],
      };

      // Setup mock implementations
      positionUtils.getPositionMetadata.mockResolvedValue(mockPositionMetadata);
      geminiService.generateQuizQuestions.mockResolvedValue(mockGeneratedQuestions);

      // Call the function
      const result = await questionGenerationService.generateQuestions(mockParams);

      // Assertions
      expect(positionUtils.getPositionMetadata).toHaveBeenCalledWith('senior');
      expect(geminiService.generateQuizQuestions).toHaveBeenCalledWith({
        topic: mockParams.topic,
        language: mockParams.language,
        position: 'senior',
        difficultyText: mockPositionMetadata.difficultyText,
        positionInstruction: mockPositionMetadata.positionInstruction,
        temperature: 0.7,
        maxOutputTokens: 8192,
      });

      expect(result).toEqual(mockGeneratedQuestions.questions);
    });
  });

  describe('prepareQuestionsWithMetadata', () => {
    test('should prepare questions with metadata', () => {
      // Setup mock data
      const mockQuestions = [
        {
          question: 'What is TypeScript?',
          options: ['A', 'B', 'C', 'D'],
          answer: 0,
        },
        {
          question: 'What are generics in TypeScript?',
          options: ['A', 'B', 'C', 'D'],
          answer: 1,
        },
      ];

      const mockMetadata = {
        topic: 'JavaScript',
        language: 'TypeScript',
        position: 'senior',
        positionLevel: 5,
      };

      const mockFormattedPosition = 'Senior';

      // Setup mock implementations
      positionUtils.formatPositionForDisplay.mockReturnValue(mockFormattedPosition);

      // Call the function
      const result = questionGenerationService.prepareQuestionsWithMetadata(
        mockQuestions,
        mockMetadata
      );

      // Assertions
      expect(positionUtils.formatPositionForDisplay).toHaveBeenCalledWith(mockMetadata.position);

      // Check that all questions have the metadata
      result.forEach(question => {
        expect(question).toHaveProperty('topic', mockMetadata.topic);
        expect(question).toHaveProperty('language', mockMetadata.language);
        expect(question).toHaveProperty('position', mockFormattedPosition);
        expect(question).toHaveProperty('positionLevel', mockMetadata.positionLevel);
        expect(question).toHaveProperty('createdAt');
        expect(question.createdAt).toBeInstanceOf(Date);
      });

      // Check that the original question data is preserved
      expect(result[0].question).toBe(mockQuestions[0].question);
      expect(result[0].options).toEqual(mockQuestions[0].options);
      expect(result[0].answer).toBe(mockQuestions[0].answer);
    });
  });

  describe('storeQuestions', () => {
    test('should store questions in the database', async () => {
      // Setup mock data
      const mockQuestions = [
        {
          question: 'What is TypeScript?',
          options: ['A', 'B', 'C', 'D'],
          answer: 0,
          topic: 'JavaScript',
          language: 'TypeScript',
          position: 'Senior',
          positionLevel: 5,
          createdAt: new Date(),
        },
      ];

      const mockInsertResult = { insertedCount: 1, insertedIds: [new ObjectId()] };

      // Setup mock implementations
      baseRepository.insertMany.mockResolvedValue(mockInsertResult);

      // Call the function
      const result = await questionGenerationService.storeQuestions(mockQuestions);

      // Assertions
      expect(baseRepository.insertMany).toHaveBeenCalledWith('questions', mockQuestions);
      expect(result).toEqual(mockInsertResult);
    });
  });

  describe('generateAndStoreQuestions', () => {
    test('should generate and store questions', async () => {
      // Setup mock data
      const mockParams = {
        topic: 'JavaScript',
        language: 'TypeScript',
        position: 'Senior',
      };

      const mockPositionMetadata = {
        difficultyText: 'deep understanding of scalable systems',
        positionInstruction: 'targeted at a senior developer',
        positionLevel: 5,
      };

      const mockGeneratedQuestions = {
        questions: [
          {
            question: 'What is TypeScript?',
            options: ['A', 'B', 'C', 'D'],
            answer: 0,
          },
        ],
      };

      const mockFormattedPosition = 'Senior';

      const mockInsertResult = { insertedCount: 1, insertedIds: [new ObjectId()] };

      // Setup mock implementations
      positionUtils.getPositionMetadata.mockResolvedValue(mockPositionMetadata);
      geminiService.generateQuizQuestions.mockResolvedValue(mockGeneratedQuestions);
      positionUtils.formatPositionForDisplay.mockReturnValue(mockFormattedPosition);
      baseRepository.insertMany.mockResolvedValue(mockInsertResult);

      // Call the function
      const result = await questionGenerationService.generateAndStoreQuestions(mockParams);

      // Assertions
      expect(positionUtils.getPositionMetadata).toHaveBeenCalledWith('senior');
      expect(geminiService.generateQuizQuestions).toHaveBeenCalled();
      expect(positionUtils.formatPositionForDisplay).toHaveBeenCalledWith(mockParams.position);
      expect(baseRepository.insertMany).toHaveBeenCalled();

      // Check that the result has the expected structure
      expect(result).toHaveLength(mockGeneratedQuestions.questions.length);
      expect(result[0]).toHaveProperty('topic', mockParams.topic);
      expect(result[0]).toHaveProperty('language', mockParams.language);
      expect(result[0]).toHaveProperty('position', mockFormattedPosition);
    });
  });
});
