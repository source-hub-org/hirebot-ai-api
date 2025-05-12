/**
 * Tests for the Question Search Validator utility
 */

const { validateSearchParams } = require('../../src/utils/questionSearchValidator');

describe('questionSearchValidator', () => {
  describe('validateSearchParams', () => {
    test('should return default values when no parameters are provided', () => {
      const query = {};
      const { params, errors } = validateSearchParams(query);

      expect(errors).toHaveLength(0);
      expect(params).toEqual({
        sort_by: 'random',
        sort_direction: 'desc',
        page: 1,
        page_size: 20,
        mode: 'full',
        ignore_question_ids: [],
      });
    });

    test('should validate topic parameter', () => {
      // Valid topic
      let query = { topic: 'JavaScript' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.topic).toBe('JavaScript');

      // Invalid topic (not a string)
      query = { topic: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('Topic must be a string');
    });

    test('should validate language parameter', () => {
      // Valid language
      let query = { language: 'Python' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.language).toBe('Python');

      // Invalid language (not a string)
      query = { language: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('Language must be a string');
    });

    test('should validate position parameter', () => {
      // Valid position
      let query = { position: 'junior' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.position).toBe('junior');

      // Valid position with different case
      query = { position: 'JUNIOR' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.position).toBe('junior');

      // Valid multiple positions
      query = { position: 'junior,middle,senior' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.position).toBe('junior,middle,senior');

      // Valid multiple positions with whitespace and different case
      query = { position: ' Junior , MIDDLE , Senior ' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.position).toBe('junior,middle,senior');

      // Invalid position (not a string)
      query = { position: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('Position must be a string');

      // Invalid position value
      query = { position: 'invalid-position' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain(
        'Position must be one of: intern, fresher, junior, middle, senior, expert'
      );

      // Invalid position in multiple positions
      query = { position: 'junior,invalid-position,senior' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain(
        'Position must be one of: intern, fresher, junior, middle, senior, expert'
      );
    });

    test('should validate sort_by parameter', () => {
      // Valid sort_by
      let query = { sort_by: 'question' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.sort_by).toBe('question');

      // Valid sort_by options
      const validSortFields = ['question', 'category', 'createdAt', 'random'];
      validSortFields.forEach(field => {
        query = { sort_by: field };
        ({ params, errors } = validateSearchParams(query));
        expect(errors).toHaveLength(0);
        expect(params.sort_by).toBe(field);
      });

      // Invalid sort_by (not a string)
      query = { sort_by: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('sort_by must be one of: question, category, createdAt, random');

      // Invalid sort_by value
      query = { sort_by: 'invalid-field' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('sort_by must be one of: question, category, createdAt, random');
    });

    test('should validate sort_direction parameter', () => {
      // Valid sort_direction
      let query = { sort_direction: 'asc' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.sort_direction).toBe('asc');

      // Valid sort_direction with different case
      query = { sort_direction: 'ASC' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.sort_direction).toBe('asc');

      // Valid sort_direction options
      const validDirections = ['asc', 'desc'];
      validDirections.forEach(direction => {
        query = { sort_direction: direction };
        ({ params, errors } = validateSearchParams(query));
        expect(errors).toHaveLength(0);
        expect(params.sort_direction).toBe(direction);
      });

      // Invalid sort_direction (not a string)
      query = { sort_direction: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('sort_direction must be one of: asc, desc');

      // Invalid sort_direction value
      query = { sort_direction: 'invalid-direction' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('sort_direction must be one of: asc, desc');
    });

    test('should validate page parameter', () => {
      // Valid page
      let query = { page: '2' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.page).toBe(2);

      // Valid page as number
      query = { page: 3 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.page).toBe(3);

      // Invalid page (not a number)
      query = { page: 'not-a-number' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page must be a positive integer');

      // Invalid page (negative number)
      query = { page: '-1' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page must be a positive integer');

      // Invalid page (zero)
      query = { page: '0' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page must be a positive integer');
    });

    test('should validate page_size parameter', () => {
      // Valid page_size
      let query = { page_size: '10' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.page_size).toBe(10);

      // Valid page_size as number
      query = { page_size: 30 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.page_size).toBe(30);

      // Invalid page_size (not a number)
      query = { page_size: 'not-a-number' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page_size must be a positive integer');

      // Invalid page_size (negative number)
      query = { page_size: '-1' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page_size must be a positive integer');

      // Invalid page_size (zero)
      query = { page_size: '0' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('page_size must be a positive integer');
    });

    test('should validate mode parameter', () => {
      // Valid mode
      let query = { mode: 'compact' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.mode).toBe('compact');

      // Valid mode with different case
      query = { mode: 'COMPACT' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.mode).toBe('compact');

      // Valid mode options
      const validModes = ['compact', 'full', 'minimalist'];
      validModes.forEach(mode => {
        query = { mode };
        ({ params, errors } = validateSearchParams(query));
        expect(errors).toHaveLength(0);
        expect(params.mode).toBe(mode);
      });

      // Invalid mode (not a string)
      query = { mode: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('mode must be one of: compact, full, minimalist');

      // Invalid mode value
      query = { mode: 'invalid-mode' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('mode must be one of: compact, full, minimalist');
    });

    test('should validate ignore_question_ids parameter', () => {
      // Valid ignore_question_ids
      let query = { ignore_question_ids: '123,456,789' };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params.ignore_question_ids).toEqual(['123', '456', '789']);

      // Valid ignore_question_ids with whitespace
      query = { ignore_question_ids: ' 123 , 456 , 789 ' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.ignore_question_ids).toEqual(['123', '456', '789']);

      // Valid empty ignore_question_ids
      query = { ignore_question_ids: '' };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(0);
      expect(params.ignore_question_ids).toEqual([]);

      // Invalid ignore_question_ids (not a string)
      query = { ignore_question_ids: 123 };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toContain('ignore_question_ids must be a string of comma-separated IDs');
    });

    test('should validate multiple parameters at once', () => {
      // All valid parameters
      let query = {
        topic: 'JavaScript',
        language: 'Python',
        position: 'junior',
        sort_by: 'question',
        sort_direction: 'asc',
        page: '2',
        page_size: '10',
        mode: 'compact',
        ignore_question_ids: '123,456,789',
      };
      let { params, errors } = validateSearchParams(query);
      expect(errors).toHaveLength(0);
      expect(params).toEqual({
        topic: 'JavaScript',
        language: 'Python',
        position: 'junior',
        sort_by: 'question',
        sort_direction: 'asc',
        page: 2,
        page_size: 10,
        mode: 'compact',
        ignore_question_ids: ['123', '456', '789'],
      });

      // Multiple invalid parameters
      query = {
        topic: 123,
        language: 456,
        position: 'invalid-position',
        sort_by: 'invalid-field',
        sort_direction: 'invalid-direction',
        page: '-1',
        page_size: '0',
        mode: 'invalid-mode',
        ignore_question_ids: 789,
      };
      ({ params, errors } = validateSearchParams(query));
      expect(errors).toHaveLength(9);
    });
  });
});
