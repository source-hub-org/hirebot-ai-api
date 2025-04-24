/**
 * Tests for the question search validator
 */

const { validateSearchParams } = require('../src/utils/questionSearchValidator');

describe('Question Search Validator', () => {
  it('should validate required parameters', () => {
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
      sort_by: 'createdAt',
      sort_direction: 'desc',
      page: 1,
      page_size: 20,
      mode: 'full',
    });
  });

  it('should validate and normalize position to lowercase', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'JUNIOR',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.position).toBe('junior');
  });

  it('should validate and normalize sort_direction to lowercase', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
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
    });
  });

  it('should detect missing required parameters', () => {
    const query = {};

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(3);
    expect(result.errors).toContain('Topic is required and must be a string');
    expect(result.errors).toContain('Language is required and must be a string');
    expect(result.errors).toContain('Position is required and must be a string');
  });

  it('should detect invalid position value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
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
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_by: 'invalid_field',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('sort_by must be one of: question, category, createdAt');
  });

  it('should detect invalid sort_direction value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      sort_direction: 'invalid_direction',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('sort_direction must be one of: asc, desc');
  });

  it('should detect invalid page value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      page: 'not_a_number',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page must be a positive integer');
  });

  it('should detect negative page value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      page: -1,
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page must be a positive integer');
  });

  it('should detect invalid page_size value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      page_size: 'not_a_number',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page_size must be a positive integer');
  });

  it('should detect negative page_size value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      page_size: -10,
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('page_size must be a positive integer');
  });

  it('should validate and normalize mode to lowercase', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'COMPACT',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.mode).toBe('compact');
  });

  it('should detect invalid mode value', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'invalid_mode',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(1);
    expect(result.errors).toContain('mode must be one of: compact, full, minimalist');
  });

  it('should validate minimalist mode', () => {
    const query = {
      topic: 'JavaScript',
      language: 'JavaScript',
      position: 'junior',
      mode: 'minimalist',
    };

    const result = validateSearchParams(query);

    expect(result.errors).toHaveLength(0);
    expect(result.params.mode).toBe('minimalist');
  });
});
