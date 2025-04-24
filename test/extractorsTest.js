/**
 * @fileoverview Tests for the extractors module
 */

const {
  extractJsonFromCodeBlocks,
  extractArrayContent,
  findJsonByBracketMatching,
  extractCodeBlockWithLanguage,
  extractAnyCodeBlock,
  extractUsingSplitMethod,
} = require('../src/service/gemini/quiz/extractors');

describe('Extractors Module Tests', () => {
  describe('extractCodeBlockWithLanguage', () => {
    test('should extract content from a code block with language specifier', () => {
      const content = 'Some text\n```json\n{"key": "value"}\n```\nMore text';
      const result = extractCodeBlockWithLanguage(content, 'json');
      expect(result).toBe('{"key": "value"}');
    });

    test('should return null if no code block with specified language is found', () => {
      const content = 'Some text\n```javascript\n{"key": "value"}\n```\nMore text';
      const result = extractCodeBlockWithLanguage(content, 'json');
      expect(result).toBeNull();
    });

    test('should be case insensitive for language matching', () => {
      const content = 'Some text\n```JSON\n{"key": "value"}\n```\nMore text';
      const result = extractCodeBlockWithLanguage(content, 'json');
      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('extractAnyCodeBlock', () => {
    test('should extract content from any code block', () => {
      const content = 'Some text\n```\n{"key": "value"}\n```\nMore text';
      const result = extractAnyCodeBlock(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should return null if no code block is found', () => {
      const content = 'Some text without code blocks';
      const result = extractAnyCodeBlock(content);
      expect(result).toBeNull();
    });
  });

  describe('extractUsingSplitMethod', () => {
    test('should extract content using split method', () => {
      const content = 'Some text\n```\n{"key": "value"}\n```\nMore text';
      const result = extractUsingSplitMethod(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should remove language identifier from first line', () => {
      const content = 'Some text\n```json\n{"key": "value"}\n```\nMore text';
      const result = extractUsingSplitMethod(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should return null if no code block is found', () => {
      const content = 'Some text without code blocks';
      const result = extractUsingSplitMethod(content);
      expect(result).toBeNull();
    });
  });

  describe('extractJsonFromCodeBlocks', () => {
    test('should extract JSON from code blocks with language specifier', () => {
      const content = 'Some text\n```json\n{"key": "value"}\n```\nMore text';
      const result = extractJsonFromCodeBlocks(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should extract JSON from code blocks without language specifier', () => {
      const content = 'Some text\n```\n{"key": "value"}\n```\nMore text';
      const result = extractJsonFromCodeBlocks(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should return original content if no code blocks are found', () => {
      const content = '{"key": "value"}';
      const result = extractJsonFromCodeBlocks(content);
      expect(result).toBe('{"key": "value"}');
    });
  });

  describe('extractArrayContent', () => {
    test('should extract array content from a string', () => {
      const content = 'Some text [{"key": "value"}] more text';
      const result = extractArrayContent(content);
      expect(result).toBe('[{"key": "value"}]');
    });

    test('should return original content if it already starts with [', () => {
      const content = '[{"key": "value"}]';
      const result = extractArrayContent(content);
      expect(result).toBe('[{"key": "value"}]');
    });

    test('should return original content if no array is found', () => {
      const content = 'Some text without arrays';
      const result = extractArrayContent(content);
      expect(result).toBe('Some text without arrays');
    });
  });

  describe('findJsonByBracketMatching', () => {
    test('should find JSON object by bracket matching', () => {
      const content = 'Some text {"key": "value"} more text';
      const result = findJsonByBracketMatching(content);
      expect(result).toBe('{"key": "value"}');
    });

    test('should find JSON array by bracket matching', () => {
      const content = 'Some text [{"key": "value"}] more text';
      const result = findJsonByBracketMatching(content);
      expect(result).toBe('[{"key": "value"}]');
    });

    test('should handle nested objects and arrays', () => {
      const content = 'Some text {"key": {"nested": [1, 2, 3]}} more text';
      const result = findJsonByBracketMatching(content);
      expect(result).toBe('{"key": {"nested": [1, 2, 3]}}');
    });

    test('should handle quoted brackets', () => {
      const content = 'Some text {"key": "value with } bracket"} more text';
      const result = findJsonByBracketMatching(content);
      expect(result).toBe('{"key": "value with } bracket"}');
    });

    test('should return null if no valid JSON is found', () => {
      const content = 'Some text without JSON';
      const result = findJsonByBracketMatching(content);
      expect(result).toBeNull();
    });
  });
});
