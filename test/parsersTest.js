/**
 * @fileoverview Tests for the parsers module
 */

const {
  parseJsonContent,
  extractQuestionsArray,
  tryParseJson,
  extractQuestionsFromProperty,
  extractSingleQuestion,
  extractQuestionsFromItems,
  extractQuestionsFromSchema,
} = require('../src/service/gemini/quiz/parsers');

describe('Parsers Module Tests', () => {
  describe('tryParseJson', () => {
    test('should parse valid JSON', () => {
      const content = '{"key": "value"}';
      const result = tryParseJson(content);
      expect(result).toEqual({ key: 'value' });
    });

    test('should return null for invalid JSON', () => {
      const content = '{ invalid json }';
      const result = tryParseJson(content);
      expect(result).toBeNull();
    });
  });

  describe('parseJsonContent', () => {
    test('should parse valid JSON content', () => {
      const content = '{"key": "value"}';
      const result = parseJsonContent(content, content);
      expect(result).toEqual({ key: 'value' });
    });

    test('should throw error for invalid JSON', () => {
      const content = '{ invalid json }';
      expect(() => {
        parseJsonContent(content, content);
      }).toThrow();
    });

    test('should attempt to find valid JSON using bracket matching', () => {
      const invalidContent = '{ invalid json }';
      const originalContent = 'Some text {"key": "value"} more text';
      const result = parseJsonContent(invalidContent, originalContent);
      expect(result).toEqual({ key: 'value' });
    });
  });

  describe('extractQuestionsFromProperty', () => {
    test('should extract questions array from questions property', () => {
      const content = {
        questions: [{ question: 'Question 1?' }, { question: 'Question 2?' }],
      };
      const result = extractQuestionsFromProperty(content);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should return null if no questions property is found', () => {
      const content = { someOtherProperty: [] };
      const result = extractQuestionsFromProperty(content);
      expect(result).toBeNull();
    });

    test('should return null if questions property is not an array', () => {
      const content = { questions: 'not an array' };
      const result = extractQuestionsFromProperty(content);
      expect(result).toBeNull();
    });
  });

  describe('extractSingleQuestion', () => {
    test('should wrap a single question object in an array', () => {
      const content = { question: 'Question?' };
      const result = extractSingleQuestion(content, false);
      expect(result).toEqual([{ question: 'Question?' }]);
    });

    test('should return null in strict mode', () => {
      const content = { question: 'Question?' };
      const result = extractSingleQuestion(content, true);
      expect(result).toBeNull();
    });

    test('should return null if no question property is found', () => {
      const content = { someOtherProperty: 'value' };
      const result = extractSingleQuestion(content, false);
      expect(result).toBeNull();
    });
  });

  describe('extractQuestionsFromItems', () => {
    test('should extract questions from items array', () => {
      const content = {
        items: [{ question: 'Question 1?' }, { question: 'Question 2?' }],
      };
      const result = extractQuestionsFromItems(content);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should return null if no items property is found', () => {
      const content = { someOtherProperty: [] };
      const result = extractQuestionsFromItems(content);
      expect(result).toBeNull();
    });

    test('should return null if items is empty', () => {
      const content = { items: [] };
      const result = extractQuestionsFromItems(content);
      expect(result).toBeNull();
    });

    test('should return null if items does not contain question objects', () => {
      const content = { items: [{ notAQuestion: 'value' }] };
      const result = extractQuestionsFromItems(content);
      expect(result).toBeNull();
    });
  });

  describe('extractQuestionsFromSchema', () => {
    test('should extract questions from a schema definition', () => {
      const content = {
        type: 'array',
        items: { type: 'object' },
        examples: [{ question: 'Question 1?' }, { question: 'Question 2?' }],
      };
      const result = extractQuestionsFromSchema(content);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should extract questions from items array in a schema', () => {
      const content = {
        type: 'array',
        items: [{ question: 'Question 1?' }, { question: 'Question 2?' }],
      };
      const result = extractQuestionsFromSchema(content);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should return null if not a schema definition', () => {
      const content = { someOtherProperty: 'value' };
      const result = extractQuestionsFromSchema(content);
      expect(result).toBeNull();
    });

    test('should handle schema with non-question array properties', () => {
      const content = {
        type: 'array',
        items: { type: 'object' },
        data: [
          { notAQuestion: 'Some value' }
        ],
        otherData: [
          { alsoNotAQuestion: 'Another value' }
        ]
      };
      const result = extractQuestionsFromSchema(content);
      expect(result).toBeNull();
    });

    test('should handle schema with empty array properties', () => {
      const content = {
        type: 'array',
        items: { type: 'object' },
        examples: []
      };
      const result = extractQuestionsFromSchema(content);
      expect(result).toBeNull();
    });
  });

  describe('extractQuestionsArray', () => {
    test('should return content if it is already an array', () => {
      const content = [{ question: 'Question 1?' }, { question: 'Question 2?' }];
      const result = extractQuestionsArray(content, false);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should extract questions from questions property', () => {
      const content = {
        questions: [{ question: 'Question 1?' }, { question: 'Question 2?' }],
      };
      const result = extractQuestionsArray(content, false);
      expect(result).toEqual([{ question: 'Question 1?' }, { question: 'Question 2?' }]);
    });

    test('should wrap a single question object in an array in non-strict mode', () => {
      const content = { question: 'Question?' };
      const result = extractQuestionsArray(content, false);
      expect(result).toEqual([{ question: 'Question?' }]);
    });

    test('should throw error if content is not an array or valid questions object', () => {
      const content = { notAQuestion: 'value' };
      expect(() => {
        extractQuestionsArray(content, false);
      }).toThrow();
    });
  });
});
