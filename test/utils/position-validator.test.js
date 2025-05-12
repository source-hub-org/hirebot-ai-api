/**
 * Tests for the Position Validator utility
 */

const {
  validatePositionsData,
  validatePositionObject,
} = require('../../src/utils/positionValidator');

describe('positionValidator', () => {
  describe('validatePositionObject', () => {
    test('should return no errors for a valid position object', () => {
      const position = {
        slug: 'junior-developer',
        title: 'Junior Developer',
        description: 'Entry level developer position',
        instruction: 'Test instructions',
        level: 2,
        is_active: true,
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toHaveLength(0);
    });

    test('should return error if position is not an object', () => {
      expect(validatePositionObject(null, 0)).toContain(
        'Position at index 0 is not a valid object'
      );
      expect(validatePositionObject(undefined, 0)).toContain(
        'Position at index 0 is not a valid object'
      );
      expect(validatePositionObject('string', 0)).toContain(
        'Position at index 0 is not a valid object'
      );
      expect(validatePositionObject(123, 0)).toContain('Position at index 0 is not a valid object');
      // Arrays are objects in JavaScript, so this will not return the "not a valid object" error
      // Instead, it will check for required fields
      const arrayErrors = validatePositionObject([], 0);
      expect(arrayErrors).toContain('Position at index 0 is missing required field: "slug"');
    });

    test('should validate required fields', () => {
      const position = {
        // Missing all required fields
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0 is missing required field: "slug"');
      expect(errors).toContain('Position at index 0 is missing required field: "title"');
      expect(errors).toContain('Position at index 0 is missing required field: "description"');
      expect(errors).toContain('Position at index 0 is missing required field: "instruction"');
      expect(errors).toContain('Position at index 0 is missing required field: "level"');
    });

    test('should validate slug field type', () => {
      const position = {
        slug: 123, // Not a string
        title: 'Junior Developer',
        description: 'Entry level developer position',
        instruction: 'Test instructions',
        level: 2,
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "slug" must be a string');
    });

    test('should validate title field type', () => {
      const position = {
        slug: 'junior-developer',
        title: 123, // Not a string
        description: 'Entry level developer position',
        instruction: 'Test instructions',
        level: 2,
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "title" must be a string');
    });

    test('should validate description field type', () => {
      const position = {
        slug: 'junior-developer',
        title: 'Junior Developer',
        description: 123, // Not a string
        instruction: 'Test instructions',
        level: 2,
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "description" must be a string');
    });

    test('should validate instruction field type', () => {
      const position = {
        slug: 'junior-developer',
        title: 'Junior Developer',
        description: 'Entry level developer position',
        instruction: 123, // Not a string
        level: 2,
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "instruction" must be a string');
    });

    test('should validate level field type', () => {
      const position = {
        slug: 'junior-developer',
        title: 'Junior Developer',
        description: 'Entry level developer position',
        instruction: 'Test instructions',
        level: 'not a number', // Not a number
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "level" must be a number');
    });

    test('should validate is_active field type if provided', () => {
      const position = {
        slug: 'junior-developer',
        title: 'Junior Developer',
        description: 'Entry level developer position',
        instruction: 'Test instructions',
        level: 2,
        is_active: 'not a boolean', // Not a boolean
      };

      const errors = validatePositionObject(position, 0);
      expect(errors).toContain('Position at index 0: "is_active" must be a boolean');
    });
  });

  describe('validatePositionsData', () => {
    test('should return valid for an array of valid position objects', () => {
      const positions = [
        {
          slug: 'junior-developer',
          title: 'Junior Developer',
          description: 'Entry level developer position',
          instruction: 'Test instructions',
          level: 2,
          is_active: true,
        },
        {
          slug: 'senior-developer',
          title: 'Senior Developer',
          description: 'Senior level developer position',
          instruction: 'Test instructions',
          level: 4,
          is_active: true,
        },
      ];

      const result = validatePositionsData(positions);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return valid for an object with positions array', () => {
      const data = {
        positions: [
          {
            slug: 'junior-developer',
            title: 'Junior Developer',
            description: 'Entry level developer position',
            instruction: 'Test instructions',
            level: 2,
            is_active: true,
          },
          {
            slug: 'senior-developer',
            title: 'Senior Developer',
            description: 'Senior level developer position',
            instruction: 'Test instructions',
            level: 4,
            is_active: true,
          },
        ],
      };

      const result = validatePositionsData(data);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid if data is not an array or object with positions array', () => {
      const result1 = validatePositionsData(null);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );

      const result2 = validatePositionsData(undefined);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );

      const result3 = validatePositionsData('string');
      expect(result3.isValid).toBe(false);
      expect(result3.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );

      const result4 = validatePositionsData(123);
      expect(result4.isValid).toBe(false);
      expect(result4.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );

      const result5 = validatePositionsData({});
      expect(result5.isValid).toBe(false);
      expect(result5.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );

      const result6 = validatePositionsData({ positions: 'not an array' });
      expect(result6.isValid).toBe(false);
      expect(result6.errors).toContain(
        'Invalid data format: expected an array of positions or an object with a positions array'
      );
    });

    test('should validate each position in the array', () => {
      const positions = [
        {
          slug: 'junior-developer',
          title: 'Junior Developer',
          description: 'Entry level developer position',
          instruction: 'Test instructions',
          level: 2,
          is_active: true,
        },
        {
          // Missing required fields
          slug: 'senior-developer',
          title: 'Senior Developer',
        },
      ];

      const result = validatePositionsData(positions);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position at index 1 is missing required field: "description"'
      );
      expect(result.errors).toContain(
        'Position at index 1 is missing required field: "instruction"'
      );
      expect(result.errors).toContain('Position at index 1 is missing required field: "level"');
    });

    test('should validate each position in the positions array of an object', () => {
      const data = {
        positions: [
          {
            slug: 'junior-developer',
            title: 'Junior Developer',
            description: 'Entry level developer position',
            instruction: 'Test instructions',
            level: 2,
            is_active: true,
          },
          {
            // Missing required fields
            slug: 'senior-developer',
            title: 'Senior Developer',
          },
        ],
      };

      const result = validatePositionsData(data);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Position at index 1 is missing required field: "description"'
      );
      expect(result.errors).toContain(
        'Position at index 1 is missing required field: "instruction"'
      );
      expect(result.errors).toContain('Position at index 1 is missing required field: "level"');
    });
  });
});
