/**
 * Tests for the Language Validator utility
 */

const { validateLanguage, validateLanguagesData } = require('../../src/utils/languageValidator');

describe('languageValidator', () => {
  describe('validateLanguage', () => {
    test('should return valid for a complete language object', () => {
      const language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented', 'Functional', 'Event-driven'],
        usage: 'Web development, server-side applications',
        popularity_rank: 1,
        type_system: 'Dynamic, Weak typing',
      };

      const result = validateLanguage(language);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid if language is not an object', () => {
      expect(validateLanguage(null).isValid).toBe(false);
      expect(validateLanguage(undefined).isValid).toBe(false);
      expect(validateLanguage('string').isValid).toBe(false);
      expect(validateLanguage(123).isValid).toBe(false);
      expect(validateLanguage([]).isValid).toBe(false);
    });

    test('should validate name field', () => {
      // Missing name
      let language = {
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language name is required');

      // Name not a string
      language = {
        name: 123,
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Language name must be a string');
    });

    test('should validate designed_by field', () => {
      // Missing designed_by
      let language = {
        name: 'JavaScript',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Designer information is required');

      // designed_by not a string
      language = {
        name: 'JavaScript',
        designed_by: 123,
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Designer information must be a string');
    });

    test('should validate first_appeared field', () => {
      // Missing first_appeared
      let language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('First appearance year is required');

      // first_appeared not a number
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 'not a number',
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'First appearance year must be a number greater than or equal to 1940'
      );

      // first_appeared too early
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1939,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'First appearance year must be a number greater than or equal to 1940'
      );
    });

    test('should validate paradigm field', () => {
      // Missing paradigm
      let language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Paradigm is required');

      // paradigm not an array
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: 'Object-oriented',
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Paradigm must be a non-empty array');

      // paradigm empty array
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: [],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Paradigm must be a non-empty array');

      // paradigm with non-string elements
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented', 123, 'Functional'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All paradigm elements must be strings');
    });

    test('should validate usage field', () => {
      // Missing usage
      let language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Usage information is required');

      // usage not a string
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 123,
        popularity_rank: 1,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Usage information must be a string');
    });

    test('should validate popularity_rank field', () => {
      // Missing popularity_rank
      let language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        type_system: 'Dynamic',
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Popularity rank is required');

      // popularity_rank not a number
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 'not a number',
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Popularity rank must be a number greater than or equal to 1'
      );

      // popularity_rank less than 1
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 0,
        type_system: 'Dynamic',
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Popularity rank must be a number greater than or equal to 1'
      );
    });

    test('should validate type_system field', () => {
      // Missing type_system
      let language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
      };
      let result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Type system information is required');

      // type_system not a string
      language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 123,
      };
      result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Type system information must be a string');
    });

    test('should validate slug field if provided', () => {
      // slug not a string
      const language = {
        name: 'JavaScript',
        designed_by: 'Brendan Eich',
        first_appeared: 1995,
        paradigm: ['Object-oriented'],
        usage: 'Web development',
        popularity_rank: 1,
        type_system: 'Dynamic',
        slug: 123,
      };
      const result = validateLanguage(language);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Slug must be a string');
    });
  });

  describe('validateLanguagesData', () => {
    test('should return valid for an array of valid language objects', () => {
      const languages = [
        {
          name: 'JavaScript',
          designed_by: 'Brendan Eich',
          first_appeared: 1995,
          paradigm: ['Object-oriented', 'Functional'],
          usage: 'Web development',
          popularity_rank: 1,
          type_system: 'Dynamic',
        },
        {
          name: 'Python',
          designed_by: 'Guido van Rossum',
          first_appeared: 1991,
          paradigm: ['Object-oriented', 'Functional'],
          usage: 'Web development, Data Science',
          popularity_rank: 2,
          type_system: 'Dynamic',
        },
      ];

      const result = validateLanguagesData(languages);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid if data is not an array', () => {
      expect(validateLanguagesData(null).isValid).toBe(false);
      expect(validateLanguagesData(undefined).isValid).toBe(false);
      expect(validateLanguagesData({}).isValid).toBe(false);
      expect(validateLanguagesData('string').isValid).toBe(false);
      expect(validateLanguagesData(123).isValid).toBe(false);
    });

    test('should return invalid if array is empty', () => {
      const result = validateLanguagesData([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Languages data array cannot be empty');
    });

    test('should validate each language in the array', () => {
      const languages = [
        {
          name: 'JavaScript',
          designed_by: 'Brendan Eich',
          first_appeared: 1995,
          paradigm: ['Object-oriented', 'Functional'],
          usage: 'Web development',
          popularity_rank: 1,
          type_system: 'Dynamic',
        },
        {
          // Missing name
          designed_by: 'Guido van Rossum',
          first_appeared: 1991,
          paradigm: ['Object-oriented', 'Functional'],
          usage: 'Web development, Data Science',
          popularity_rank: 2,
          type_system: 'Dynamic',
        },
      ];

      const result = validateLanguagesData(languages);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Language at index 1 is invalid');
      expect(result.errors[0]).toContain('Language name is required');
    });

    test('should collect errors from multiple invalid languages', () => {
      const languages = [
        {
          // Missing name
          designed_by: 'Brendan Eich',
          first_appeared: 1995,
          paradigm: ['Object-oriented'],
          usage: 'Web development',
          popularity_rank: 1,
          type_system: 'Dynamic',
        },
        {
          name: 'Python',
          // Missing designed_by
          first_appeared: 1991,
          paradigm: ['Object-oriented'],
          usage: 'Web development',
          popularity_rank: 2,
          type_system: 'Dynamic',
        },
      ];

      const result = validateLanguagesData(languages);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toContain('Language at index 0 is invalid');
      expect(result.errors[0]).toContain('Language name is required');
      expect(result.errors[1]).toContain('Language at index 1 is invalid');
      expect(result.errors[1]).toContain('Designer information is required');
    });
  });
});
