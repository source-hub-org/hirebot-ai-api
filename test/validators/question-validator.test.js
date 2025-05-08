/**
 * Tests for the question validator module
 * @module test/validators/question-validator.test
 */

const {
  validateQuestionData,
  formatValidationErrorResponse,
} = require('../../src/utils/questionValidator');

describe('Question Validator Tests', () => {
  describe('validateQuestionData', () => {
    test('should validate a valid question object', () => {
      const validQuestion = {
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
      };

      const result = validateQuestionData(validQuestion);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    test('should return error for missing question data', () => {
      const result = validateQuestionData(null);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question data is required');
    });

    test('should validate question text field', () => {
      // Missing question text
      let result = validateQuestionData({
        // question field missing
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');

      // Empty question text
      result = validateQuestionData({
        question: '',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');

      // Non-string question text
      result = validateQuestionData({
        question: 123,
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');
    });

    test('should validate options field', () => {
      // Missing options
      let result = validateQuestionData({
        question: 'Question',
        // options field missing
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must be an array');

      // Options not an array
      result = validateQuestionData({
        question: 'Question',
        options: 'Not an array',
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must be an array');

      // Wrong number of options
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C'], // Only 3 options
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must contain exactly 4 items');

      // Empty option string
      result = validateQuestionData({
        question: 'Question',
        options: ['A', '', 'C', 'D'], // Empty option
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All options must be non-empty strings');

      // Non-string option
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 123, 'C', 'D'], // Non-string option
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All options must be non-empty strings');
    });

    test('should validate correctAnswer field', () => {
      // Missing correctAnswer
      let result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        // correctAnswer field missing
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer index is required');

      // correctAnswer out of range (too high)
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 4, // Should be 0-3
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');

      // correctAnswer out of range (too low)
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: -1, // Should be 0-3
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');

      // correctAnswer not an integer
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 1.5, // Should be an integer
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');
    });

    test('should validate explanation field', () => {
      // Missing explanation
      let result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        // explanation field missing
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');

      // Empty explanation
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');

      // Non-string explanation
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 123,
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');
    });

    test('should validate difficulty field', () => {
      // Missing difficulty
      let result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        // difficulty field missing
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty is required and must be a string');

      // Invalid difficulty value
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'invalid', // Not one of: easy, medium, hard
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty must be one of: easy, medium, hard');

      // Non-string difficulty
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 123,
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty is required and must be a string');
    });

    test('should validate category, topic, language, and position fields', () => {
      // Missing category
      let result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        // category field missing
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required and must be a non-empty string');

      // Missing topic
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        // topic field missing
        language: 'Language',
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required and must be a non-empty string');

      // Missing language
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        // language field missing
        position: 'Position',
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language is required and must be a non-empty string');

      // Missing position
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        // position field missing
        positionLevel: 1,
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position is required and must be a non-empty string');
    });

    test('should validate positionLevel field', () => {
      // Missing positionLevel
      let result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        // positionLevel field missing
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position level is required');

      // positionLevel too low
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 0, // Should be >= 1
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position level must be an integer greater than or equal to 1'
      );

      // positionLevel not an integer
      result = validateQuestionData({
        question: 'Question',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 0,
        explanation: 'Explanation',
        difficulty: 'easy',
        category: 'Category',
        topic: 'Topic',
        language: 'Language',
        position: 'Position',
        positionLevel: 1.5, // Should be an integer
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position level must be an integer greater than or equal to 1'
      );
    });
  });

  describe('formatValidationErrorResponse', () => {
    test('should format validation error response correctly', () => {
      const errors = ['Error 1', 'Error 2'];
      const response = formatValidationErrorResponse(errors);

      expect(response).toEqual({
        status: 'error',
        message: 'Validation failed',
        errors: ['Error 1', 'Error 2'],
      });
    });
  });
});
