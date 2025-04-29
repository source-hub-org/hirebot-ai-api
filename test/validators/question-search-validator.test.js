/**
 * Tests for the question search validator
 */

const { validateSearchParams } = require('../../src/utils/questionSearchValidator');

describe('Question Search Validator', () => {
  it('should validate with all parameters', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'random',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
      ignore_question_ids: [],
    });
  });

  it('should validate with no parameters', () => {
    const query = {};

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      sort_by: 'random',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
      ignore_question_ids: [],
    });
  });

  it('should validate with only topic parameter', () => {
    const query = {
      topic: 'JavaScript',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      topic: 'JavaScript',
      sort_by: 'random',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
      ignore_question_ids: [],
    });
  });

  it('should validate with only language parameter', () => {
    const query = {
      language: 'JavaScript',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      language: 'JavaScript',
      sort_by: 'random',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
      ignore_question_ids: [],
    });
  });

  it('should validate with only position parameter', () => {
    const query = {
      position: 'junior',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      position: 'junior',
      sort_by: 'random',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
      ignore_question_ids: [],
    });
  });

  it('should validate and normalize position to lowercase', () => {
    const query = {
      position: 'JUNIOR',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.position).toBe('junior');
  });

  it('should validate and normalize sort_direction to lowercase', () => {
    const query = {
      sort_direction: 'ASC',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.sort_direction).toBe('asc');
  });

  it('should validate custom parameters', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'question',
      sort_direction: 'asc',
      page: '2',
      page_size: '10',
      mode: 'compact',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params).toEqual({
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'question',
      sort_direction: 'asc',
      page: 2,
      page_size: 10,
      mode: 'compact',
      ignore_question_ids: [],
    });
  });

  it('should detect invalid topic type', () => {
    const query = {
      topic: 123, // Not a string
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('Topic must be a string');
  });

  it('should detect invalid language type', () => {
    const query = {
      language: 123, // Not a string
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('Language must be a string');
  });

  it('should detect invalid position type', () => {
    const query = {
      position: 123, // Not a string
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('Position must be a string');
  });

  it('should detect invalid position value', () => {
    const query = {
      position: 'invalid_position',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain(
      'Position must be one of: intern, fresher, junior, middle, senior, expert'
    );
  });

  it('should detect invalid sort_by value', () => {
    const query = {
      sort_by: 'invalid_field',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain(
      'sort_by must be one of: question, category, createdAt, random'
    );
  });

  it('should detect invalid sort_direction value', () => {
    const query = {
      sort_direction: 'invalid_direction',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('sort_direction must be one of: asc, desc');
  });

  it('should detect invalid page value', () => {
    const query = {
      page: 'not_a_number',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page must be a positive integer');
  });

  it('should detect negative page value', () => {
    const query = {
      page: -1,
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page must be a positive integer');
  });

  it('should detect invalid page_size value', () => {
    const query = {
      page_size: 'not_a_number',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page_size must be a positive integer');
  });

  it('should detect negative page_size value', () => {
    const query = {
      page_size: -10,
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page_size must be a positive integer');
  });

  it('should validate and normalize mode to lowercase', () => {
    const query = {
      mode: 'COMPACT',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.mode).toBe('compact');
  });

  it('should detect invalid mode value', () => {
    const query = {
      mode: 'invalid_mode',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('mode must be one of: compact, full, minimalist');
  });

  it('should validate minimalist mode', () => {
    const query = {
      mode: 'minimalist',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.mode).toBe('minimalist');
  });

  it('should validate random sort option', () => {
    const query = {
      sort_by: 'random',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.sort_by).toBe('random');
  });

  it('should validate and process ignore_question_ids parameter', () => {
    const query = {
      ignore_question_ids: '5f9d88b3e5daad3f349c2e2d,5f9d88b3e5daad3f349c2e2e',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.ignore_question_ids).toEqual([
      '5f9d88b3e5daad3f349c2e2d',
      '5f9d88b3e5daad3f349c2e2e',
    ]);
  });

  it('should handle empty ignore_question_ids parameter', () => {
    const query = {
      ignore_question_ids: '',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.ignore_question_ids).toEqual([]);
  });

  it('should validate ignore_question_ids type', () => {
    const query = {
      ignore_question_ids: 123, // Not a string
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('ignore_question_ids must be a string of comma-separated IDs');
  });
});
