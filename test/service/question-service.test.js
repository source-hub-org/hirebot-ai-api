/**
 * Tests for the question service module
 * @module test/service/question-service.test
 */

const {
  createNewQuestion,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} = require('../../src/services/questionService');
const {
  createQuestion,
  getQuestionById,
  updateQuestionById,
  deleteQuestionById,
} = require('../../src/repository/questionRepository');

// Mock the repository module
jest.mock('../../src/repository/questionRepository');

describe('Question Service Tests', () => {
  // Sample question for testing
  const sampleQuestion = {
    _id: '60d21b4667d0d8992e610c85',
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
    createdAt: '2023-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createNewQuestion', () => {
    test('should create a new question successfully', async () => {
      // Mock repository to return the created question
      createQuestion.mockResolvedValue(sampleQuestion);

      // Create a new question without the _id field
      const newQuestion = { ...sampleQuestion };
      delete newQuestion._id;

      // Call the service
      const result = await createNewQuestion(newQuestion);

      // Verify result
      expect(result).toEqual(sampleQuestion);
      expect(createQuestion).toHaveBeenCalledWith(expect.objectContaining(newQuestion));
    });

    test('should normalize question data before creating', async () => {
      // Mock repository to return the created question
      createQuestion.mockResolvedValue(sampleQuestion);

      // Create a question with data that needs normalization
      const questionWithUntrimmedData = {
        question: '  What is a closure in JavaScript?  ',
        options: ['  Option A  ', 'Option B', 'Option C', 'Option D'],
        correctAnswer: '2', // String instead of number
        explanation: '  Explanation with whitespace  ',
        difficulty: 'MEDIUM', // Uppercase
        category: '  Category  ',
        topic: '  Topic  ',
        language: '  Language  ',
        position: '  Position  ',
        positionLevel: '3', // String instead of number
      };

      // Call the service
      await createNewQuestion(questionWithUntrimmedData);

      // Verify the data was normalized
      expect(createQuestion).toHaveBeenCalledWith(
        expect.objectContaining({
          question: 'What is a closure in JavaScript?', // Trimmed
          options: [
            'Option A', // Trimmed
            'Option B',
            'Option C',
            'Option D',
          ],
          correctAnswer: 2, // Converted to number
          explanation: 'Explanation with whitespace', // Trimmed
          difficulty: 'medium', // Lowercase
          category: 'Category', // Trimmed
          topic: 'Topic', // Trimmed
          language: 'Language', // Trimmed
          position: 'Position', // Trimmed
          positionLevel: 3, // Converted to number
        })
      );
    });

    test('should handle errors during creation', async () => {
      // Mock repository to throw error
      const error = new Error('Database error');
      createQuestion.mockRejectedValue(error);

      // Create a new question without the _id field
      const newQuestion = { ...sampleQuestion };
      delete newQuestion._id;

      // Call the service and expect it to throw
      await expect(createNewQuestion(newQuestion)).rejects.toThrow('Database error');
      expect(createQuestion).toHaveBeenCalled();
    });
  });

  describe('getQuestion', () => {
    test('should get a question by ID successfully', async () => {
      // Mock repository to return the sample question
      getQuestionById.mockResolvedValue(sampleQuestion);

      // Call the service
      const result = await getQuestion(sampleQuestion._id);

      // Verify result
      expect(result).toEqual(sampleQuestion);
      expect(getQuestionById).toHaveBeenCalledWith(sampleQuestion._id);
    });

    test('should return null when question is not found', async () => {
      // Mock repository to return null
      getQuestionById.mockResolvedValue(null);

      // Call the service
      const result = await getQuestion('nonexistent-id');

      // Verify result
      expect(result).toBeNull();
      expect(getQuestionById).toHaveBeenCalledWith('nonexistent-id');
    });

    test('should handle errors during retrieval', async () => {
      // Mock repository to throw error
      const error = new Error('Database error');
      getQuestionById.mockRejectedValue(error);

      // Call the service and expect it to throw
      await expect(getQuestion(sampleQuestion._id)).rejects.toThrow('Database error');
      expect(getQuestionById).toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    test('should update a question successfully', async () => {
      // Create an updated question
      const updatedQuestion = {
        ...sampleQuestion,
        question: 'Updated question text',
        explanation: 'Updated explanation',
      };

      // Mock repository to return the updated question
      updateQuestionById.mockResolvedValue(updatedQuestion);

      // Call the service
      const result = await updateQuestion(sampleQuestion._id, updatedQuestion);

      // Verify result
      expect(result).toEqual(updatedQuestion);
      expect(updateQuestionById).toHaveBeenCalledWith(
        sampleQuestion._id,
        expect.objectContaining({
          question: 'Updated question text',
          explanation: 'Updated explanation',
        })
      );
    });

    test('should normalize question data before updating', async () => {
      // Mock repository to return the updated question
      updateQuestionById.mockResolvedValue(sampleQuestion);

      // Create update data with values that need normalization
      const updateWithUntrimmedData = {
        question: '  Updated question text  ',
        difficulty: 'HARD', // Uppercase
        correctAnswer: '1', // String instead of number
      };

      // Call the service
      await updateQuestion(sampleQuestion._id, updateWithUntrimmedData);

      // Verify the data was normalized
      expect(updateQuestionById).toHaveBeenCalledWith(
        sampleQuestion._id,
        expect.objectContaining({
          question: 'Updated question text', // Trimmed
          difficulty: 'hard', // Lowercase
          correctAnswer: 1, // Converted to number
        })
      );
    });

    test('should return null when question is not found', async () => {
      // Mock repository to return null
      updateQuestionById.mockResolvedValue(null);

      // Call the service
      const result = await updateQuestion('nonexistent-id', sampleQuestion);

      // Verify result
      expect(result).toBeNull();
      expect(updateQuestionById).toHaveBeenCalledWith('nonexistent-id', expect.any(Object));
    });

    test('should handle errors during update', async () => {
      // Mock repository to throw error
      const error = new Error('Database error');
      updateQuestionById.mockRejectedValue(error);

      // Call the service and expect it to throw
      await expect(updateQuestion(sampleQuestion._id, sampleQuestion)).rejects.toThrow(
        'Database error'
      );
      expect(updateQuestionById).toHaveBeenCalled();
    });
  });

  describe('deleteQuestion', () => {
    test('should delete a question successfully', async () => {
      // Mock repository to return true (successful deletion)
      deleteQuestionById.mockResolvedValue(true);

      // Call the service
      const result = await deleteQuestion(sampleQuestion._id);

      // Verify result
      expect(result).toBe(true);
      expect(deleteQuestionById).toHaveBeenCalledWith(sampleQuestion._id);
    });

    test('should return false when question is not found', async () => {
      // Mock repository to return false
      deleteQuestionById.mockResolvedValue(false);

      // Call the service
      const result = await deleteQuestion('nonexistent-id');

      // Verify result
      expect(result).toBe(false);
      expect(deleteQuestionById).toHaveBeenCalledWith('nonexistent-id');
    });

    test('should handle errors during deletion', async () => {
      // Mock repository to throw error
      const error = new Error('Database error');
      deleteQuestionById.mockRejectedValue(error);

      // Call the service and expect it to throw
      await expect(deleteQuestion(sampleQuestion._id)).rejects.toThrow('Database error');
      expect(deleteQuestionById).toHaveBeenCalled();
    });
  });
});
