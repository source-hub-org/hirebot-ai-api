/**
 * Tests for the Generate Request Validator utility
 */

const { validateGenerateRequest } = require('../../src/utils/generateRequestValidator');
const { VALID_POSITIONS } = require('../../src/utils/positionUtils');

// Mock the positionUtils module
jest.mock('../../src/utils/positionUtils', () => ({
  VALID_POSITIONS: ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert'],
}));

describe('generateRequestValidator', () => {
  describe('validateGenerateRequest', () => {
    test('should return valid for a complete and valid request', () => {
      const requestBody = {
        topic: 'JavaScript',
        language: 'English',
        position: 'junior',
      };

      const result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate topic field', () => {
      // Missing topic
      let requestBody = {
        language: 'English',
        position: 'junior',
      };
      let result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required and must be a string');

      // Topic not a string
      requestBody = {
        topic: 123,
        language: 'English',
        position: 'junior',
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required and must be a string');

      // Empty topic
      requestBody = {
        topic: '',
        language: 'English',
        position: 'junior',
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Topic is required and must be a string');
    });

    test('should validate language field', () => {
      // Missing language
      let requestBody = {
        topic: 'JavaScript',
        position: 'junior',
      };
      let result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language is required and must be a string');

      // Language not a string
      requestBody = {
        topic: 'JavaScript',
        language: 123,
        position: 'junior',
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language is required and must be a string');

      // Empty language
      requestBody = {
        topic: 'JavaScript',
        language: '',
        position: 'junior',
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language is required and must be a string');
    });

    test('should validate position field', () => {
      // Missing position
      let requestBody = {
        topic: 'JavaScript',
        language: 'English',
      };
      let result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position is required and must be a string');

      // Position not a string
      requestBody = {
        topic: 'JavaScript',
        language: 'English',
        position: 123,
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position is required and must be a string');

      // Empty position
      requestBody = {
        topic: 'JavaScript',
        language: 'English',
        position: '',
      };
      result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Position is required and must be a string');
    });

    test('should validate position is one of the allowed values', () => {
      // Invalid position
      const requestBody = {
        topic: 'JavaScript',
        language: 'English',
        position: 'invalid-position',
      };
      const result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(`Position must be one of: ${VALID_POSITIONS.join(', ')}`);
    });

    test('should accept valid positions with different case', () => {
      // Valid positions with different case
      const validPositions = ['Intern', 'FRESHER', 'Junior', 'MIDDLE', 'Senior', 'EXPERT'];

      validPositions.forEach(position => {
        const requestBody = {
          topic: 'JavaScript',
          language: 'English',
          position,
        };
        const result = validateGenerateRequest(requestBody);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    test('should validate multiple fields at once', () => {
      // Multiple invalid fields
      const requestBody = {
        topic: 123,
        language: 456,
        position: 'invalid-position',
      };
      const result = validateGenerateRequest(requestBody);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors).toContain('Topic is required and must be a string');
      expect(result.errors).toContain('Language is required and must be a string');
      expect(result.errors).toContain(`Position must be one of: ${VALID_POSITIONS.join(', ')}`);
    });
  });
});
