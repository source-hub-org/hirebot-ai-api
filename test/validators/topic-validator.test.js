/**
 * Tests for the topic validator module
 * @module test/topicValidatorTest
 */

const { validateTopicsData, validateTopicObject } = require('../../src/utils/topicValidator');

describe('Topic Validator Tests', () => {
  describe('validateTopicsData', () => {
    test('should validate correct topics data structure', () => {
      const validData = {
        topics: [
          {
            title: 'Test Topic',
            difficulty: 1,
            popularity: 'low',
            suitable_level: 'intern',
            description: 'Test description',
          },
        ],
      };

      const result = validateTopicsData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null or undefined data', () => {
      const result1 = validateTopicsData(null);
      const result2 = validateTopicsData(undefined);

      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Invalid data format: expected an object');

      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Invalid data format: expected an object');
    });

    test('should reject data without topics array', () => {
      const invalidData = { notTopics: [] };

      const result = validateTopicsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid data format: missing or invalid "topics" array');
    });

    test('should reject data with non-array topics', () => {
      const invalidData = { topics: 'not an array' };

      const result = validateTopicsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid data format: missing or invalid "topics" array');
    });

    test('should validate all topics in the array', () => {
      const mixedData = {
        topics: [
          // Valid topic
          {
            title: 'Valid Topic',
            difficulty: 1,
            popularity: 'low',
            suitable_level: 'intern',
            description: 'Valid description',
          },
          // Invalid topic (missing fields)
          {
            title: 'Invalid Topic',
          },
        ],
      };

      const result = validateTopicsData(mixedData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Topic at index 1 is missing required field: "difficulty"');
      expect(result.errors).toContain('Topic at index 1 is missing required field: "popularity"');
      expect(result.errors).toContain(
        'Topic at index 1 is missing required field: "suitable_level"'
      );
      expect(result.errors).toContain('Topic at index 1 is missing required field: "description"');
    });
  });

  describe('validateTopicObject', () => {
    test('should validate a correct topic object', () => {
      const validTopic = {
        title: 'Test Topic',
        difficulty: 1,
        popularity: 'low',
        suitable_level: 'intern',
        description: 'Test description',
      };

      const errors = validateTopicObject(validTopic, 0);

      expect(errors).toHaveLength(0);
    });

    test('should reject null or undefined topic', () => {
      const errors1 = validateTopicObject(null, 0);
      const errors2 = validateTopicObject(undefined, 0);

      expect(errors1).toContain('Topic at index 0 is not a valid object');
      expect(errors2).toContain('Topic at index 0 is not a valid object');
    });

    test('should detect missing required fields', () => {
      const invalidTopic = {
        title: 'Test Topic',
        // Missing other required fields
      };

      const errors = validateTopicObject(invalidTopic, 0);

      expect(errors).toContain('Topic at index 0 is missing required field: "difficulty"');
      expect(errors).toContain('Topic at index 0 is missing required field: "popularity"');
      expect(errors).toContain('Topic at index 0 is missing required field: "suitable_level"');
      expect(errors).toContain('Topic at index 0 is missing required field: "description"');
    });

    test('should validate field types', () => {
      const invalidTypesTopic = {
        title: 123, // Should be string
        difficulty: 'high', // Should be number
        popularity: 42, // Should be string
        suitable_level: true, // Should be string
        description: {}, // Should be string
      };

      const errors = validateTopicObject(invalidTypesTopic, 0);

      expect(errors).toContain('Topic at index 0: "title" must be a string');
      expect(errors).toContain('Topic at index 0: "difficulty" must be a number');
      expect(errors).toContain('Topic at index 0: "popularity" must be a string');
      expect(errors).toContain('Topic at index 0: "suitable_level" must be a string');
      expect(errors).toContain('Topic at index 0: "description" must be a string');
    });
  });
});
