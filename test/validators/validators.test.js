/**
 * @fileoverview Tests for the validators module
 */

const {
  validateQuestions,
  validateQuestionField,
  validateOptionsArray,
  ensureFourOptions,
  validateCorrectAnswer,
  ensureExplanation,
  validateDifficulty,
  ensureCategory,
} = require('../../src/services/gemini/quiz/validators');

describe('Validators Module Tests', () => {
  describe('validateQuestionField', () => {
    test('should not throw error for valid question field', () => {
      const question = { question: 'Valid question?' };
      expect(() => {
        validateQuestionField(question, 0);
      }).not.toThrow();
    });

    test('should throw error for missing question field', () => {
      const question = { notAQuestion: 'value' };
      expect(() => {
        validateQuestionField(question, 0);
      }).toThrow("Question 1 is missing the 'question' field");
    });
  });

  describe('validateOptionsArray', () => {
    test('should not throw error for valid options array', () => {
      const question = { options: ['A', 'B', 'C', 'D'] };
      expect(() => {
        validateOptionsArray(question, 0);
      }).not.toThrow();
    });

    test('should throw error for missing options array', () => {
      const question = { notOptions: 'value' };
      expect(() => {
        validateOptionsArray(question, 0);
      }).toThrow("Question 1 has invalid or missing 'options' array");
    });

    test('should throw error for options not being an array', () => {
      const question = { options: 'not an array' };
      expect(() => {
        validateOptionsArray(question, 0);
      }).toThrow("Question 1 has invalid or missing 'options' array");
    });
  });

  describe('ensureFourOptions', () => {
    test('should not modify valid options array with 4 options', () => {
      const question = { options: ['A', 'B', 'C', 'D'] };
      ensureFourOptions(question, 0, false);
      expect(question.options).toEqual(['A', 'B', 'C', 'D']);
    });

    test('should add placeholder options if fewer than 4 in non-strict mode', () => {
      const question = { options: ['A', 'B'] };
      ensureFourOptions(question, 0, false);
      expect(question.options.length).toBe(4);
      expect(question.options[2]).toBe('Option 3 (placeholder)');
      expect(question.options[3]).toBe('Option 4 (placeholder)');
    });

    test('should truncate options if more than 4 in non-strict mode', () => {
      const question = { options: ['A', 'B', 'C', 'D', 'E', 'F'] };
      ensureFourOptions(question, 0, false);
      expect(question.options.length).toBe(4);
      expect(question.options).toEqual(['A', 'B', 'C', 'D']);
    });

    test('should throw error if not exactly 4 options in strict mode', () => {
      const question = { options: ['A', 'B'] };
      expect(() => {
        ensureFourOptions(question, 0, true);
      }).toThrow('Question 1 must have exactly 4 options');
    });
  });

  describe('validateCorrectAnswer', () => {
    test('should not modify valid correctAnswer', () => {
      const question = { correctAnswer: 2 };
      validateCorrectAnswer(question, 0, false);
      expect(question.correctAnswer).toBe(2);
    });

    test('should convert string to number in non-strict mode', () => {
      const question = { correctAnswer: '2' };
      validateCorrectAnswer(question, 0, false);
      expect(question.correctAnswer).toBe(2);
    });

    test('should set default correctAnswer if invalid in non-strict mode', () => {
      const question = { correctAnswer: 'invalid' };
      validateCorrectAnswer(question, 0, false);
      expect(question.correctAnswer).toBe(0);
    });

    test('should set default correctAnswer if missing in non-strict mode', () => {
      const question = {};
      validateCorrectAnswer(question, 0, false);
      expect(question.correctAnswer).toBe(0);
    });

    test('should throw error if invalid correctAnswer in strict mode', () => {
      const question = { correctAnswer: 5 };
      expect(() => {
        validateCorrectAnswer(question, 0, true);
      }).toThrow("Question 1 has an invalid 'correctAnswer' (must be 0-3)");
    });
  });

  describe('ensureExplanation', () => {
    test('should not modify valid explanation', () => {
      const question = { explanation: 'Valid explanation' };
      ensureExplanation(question, 0, false);
      expect(question.explanation).toBe('Valid explanation');
    });

    test('should add default explanation if missing in non-strict mode', () => {
      const question = { correctAnswer: 2 };
      ensureExplanation(question, 0, false);
      expect(question.explanation).toBe('The correct answer is option 3.');
    });

    test('should throw error if missing explanation in strict mode', () => {
      const question = {};
      expect(() => {
        ensureExplanation(question, 0, true);
      }).toThrow("Question 1 is missing the 'explanation' field");
    });
  });

  describe('validateDifficulty', () => {
    test('should not modify valid difficulty', () => {
      const question = { difficulty: 'medium' };
      validateDifficulty(question, 0, false);
      expect(question.difficulty).toBe('medium');
    });

    test('should convert difficulty to lowercase', () => {
      const question = { difficulty: 'HARD' };
      validateDifficulty(question, 0, false);
      expect(question.difficulty).toBe('hard');
    });

    test('should set default difficulty if invalid in non-strict mode', () => {
      const question = { difficulty: 'invalid' };
      validateDifficulty(question, 0, false);
      expect(question.difficulty).toBe('medium');
    });

    test('should set default difficulty if missing in non-strict mode', () => {
      const question = {};
      validateDifficulty(question, 0, false);
      expect(question.difficulty).toBe('medium');
    });

    test('should throw error if invalid difficulty in strict mode', () => {
      const question = { difficulty: 'invalid' };
      expect(() => {
        validateDifficulty(question, 0, true);
      }).toThrow("Question 1 has an invalid 'difficulty' (must be easy, medium, or hard)");
    });
  });

  describe('ensureCategory', () => {
    test('should not modify valid category', () => {
      const question = { category: 'JavaScript' };
      ensureCategory(question, 0, false);
      expect(question.category).toBe('JavaScript');
    });

    test('should add default category if missing in non-strict mode', () => {
      const question = {};
      ensureCategory(question, 0, false);
      expect(question.category).toBe('General');
    });

    test('should throw error if missing category in strict mode', () => {
      const question = {};
      expect(() => {
        ensureCategory(question, 0, true);
      }).toThrow("Question 1 is missing the 'category' field");
    });
  });

  describe('validateQuestions', () => {
    test('should validate and return valid questions array', () => {
      const questions = [
        {
          question: 'Question 1?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 2,
          explanation: 'Explanation 1',
          difficulty: 'easy',
          category: 'Category 1',
        },
        {
          question: 'Question 2?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 1,
          explanation: 'Explanation 2',
          difficulty: 'medium',
          category: 'Category 2',
        },
      ];

      const result = validateQuestions(questions, false);
      expect(result).toEqual(questions);
    });

    test('should fix issues in non-strict mode', () => {
      const questions = [
        {
          question: 'Question 1?',
          options: ['A', 'B'],
          correctAnswer: '2',
          difficulty: 'HARD',
        },
      ];

      const result = validateQuestions(questions, false);

      expect(result[0].options.length).toBe(4);
      expect(result[0].correctAnswer).toBe(2);
      expect(result[0].explanation).toBeDefined();
      expect(result[0].difficulty).toBe('hard');
      expect(result[0].category).toBe('General');
    });

    test('should throw error for invalid questions in strict mode', () => {
      const questions = [
        {
          question: 'Question 1?',
          options: ['A', 'B'],
          correctAnswer: 2,
          explanation: 'Explanation',
          difficulty: 'medium',
          category: 'Category',
        },
      ];

      expect(() => {
        validateQuestions(questions, true);
      }).toThrow('Question 1 must have exactly 4 options');
    });
  });
});
