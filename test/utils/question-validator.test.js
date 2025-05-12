/**
 * Tests for the Question Validator utility
 */

const {
  validateQuestionData,
  formatValidationErrorResponse,
} = require('../../src/utils/questionValidator');

describe('questionValidator', () => {
  describe('validateQuestionData', () => {
    test('should return valid for a complete and valid question', () => {
      const questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };

      const result = validateQuestionData(questionData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid if no data is provided', () => {
      const result = validateQuestionData(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question data is required');
    });

    test('should validate question text', () => {
      // Missing question
      let questionData = {
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');

      // Question not a string
      questionData = {
        question: 123,
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');

      // Empty question
      questionData = {
        question: '',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');

      // Whitespace-only question
      questionData = {
        question: '   ',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Question text is required and must be a non-empty string');
    });

    test('should validate options', () => {
      // Missing options
      let questionData = {
        question: 'What is JavaScript?',
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must be an array');

      // Options not an array
      questionData = {
        question: 'What is JavaScript?',
        options: 'Not an array',
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must be an array');

      // Wrong number of options
      questionData = {
        question: 'What is JavaScript?',
        options: ['A programming language', 'A markup language', 'A database'],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Options must contain exactly 4 items');

      // Options with non-string elements
      questionData = {
        question: 'What is JavaScript?',
        options: ['A programming language', 123, 'A database', 'An operating system'],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All options must be non-empty strings');

      // Options with empty strings
      questionData = {
        question: 'What is JavaScript?',
        options: ['A programming language', '', 'A database', 'An operating system'],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All options must be non-empty strings');
    });

    test('should validate correctAnswer', () => {
      // Missing correctAnswer
      let questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer index is required');

      // correctAnswer not an integer
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 'not a number',
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');

      // correctAnswer out of range (negative)
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: -1,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');

      // correctAnswer out of range (too high)
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 4,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Correct answer must be an integer between 0 and 3');
    });

    test('should validate explanation', () => {
      // Missing explanation
      let questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');

      // Explanation not a string
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 123,
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');

      // Empty explanation
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Explanation is required and must be a non-empty string');
    });

    test('should validate difficulty', () => {
      // Missing difficulty
      let questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty is required and must be a string');

      // Difficulty not a string
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 123,
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty is required and must be a string');

      // Invalid difficulty value
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'invalid-difficulty',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Difficulty must be one of: easy, medium, hard');

      // Valid difficulty with different case
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'EASY',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate category, topic, language, and position', () => {
      // Missing fields
      let questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        positionLevel: 2,
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required and must be a non-empty string');
      expect(result.errors).toContain('Topic is required and must be a non-empty string');
      expect(result.errors).toContain('Language is required and must be a non-empty string');
      expect(result.errors).toContain('Position is required and must be a non-empty string');

      // Fields not strings
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 123,
        topic: 456,
        language: 789,
        position: 101112,
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required and must be a non-empty string');
      expect(result.errors).toContain('Topic is required and must be a non-empty string');
      expect(result.errors).toContain('Language is required and must be a non-empty string');
      expect(result.errors).toContain('Position is required and must be a non-empty string');

      // Empty fields
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: '',
        topic: '',
        language: '',
        position: '',
        positionLevel: 2,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required and must be a non-empty string');
      expect(result.errors).toContain('Topic is required and must be a non-empty string');
      expect(result.errors).toContain('Language is required and must be a non-empty string');
      expect(result.errors).toContain('Position is required and must be a non-empty string');
    });

    test('should validate positionLevel', () => {
      // Missing positionLevel
      let questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
      };
      let result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position level is required');

      // positionLevel not an integer
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 'not a number',
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position level must be an integer greater than or equal to 1'
      );

      // positionLevel less than 1
      questionData = {
        question: 'What is JavaScript?',
        options: [
          'A programming language',
          'A markup language',
          'A database',
          'An operating system',
        ],
        correctAnswer: 0,
        explanation: 'JavaScript is a programming language used for web development.',
        difficulty: 'easy',
        category: 'Programming',
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
        positionLevel: 0,
      };
      result = validateQuestionData(questionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position level must be an integer greater than or equal to 1'
      );
    });
  });

  describe('formatValidationErrorResponse', () => {
    test('should format validation errors correctly', () => {
      const errors = ['Error 1', 'Error 2', 'Error 3'];
      const response = formatValidationErrorResponse(errors);

      expect(response).toEqual({
        status: 'error',
        message: 'Validation failed',
        errors,
      });
    });

    test('should handle empty errors array', () => {
      const response = formatValidationErrorResponse([]);

      expect(response).toEqual({
        status: 'error',
        message: 'Validation failed',
        errors: [],
      });
    });
  });
});
