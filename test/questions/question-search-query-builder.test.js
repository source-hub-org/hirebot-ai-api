/**
 * Tests for the question search query builder
 */

const { buildMongoQuery } = require('../../src/utils/questionSearchQueryBuilder');

describe('Question Search Query Builder', () => {
  it('should build a query with default parameters', () => {
    const result = buildMongoQuery(
      'JavaScript',
      'JavaScript',
      'junior',
      'createdAt',
      'desc',
      1,
      20
    );

    // Check filter
    expect(result.filter).toHaveProperty('$and');
    expect(result.filter.$and).toBeInstanceOf(Array);
    expect(result.filter.$and.length).toBe(3); // One for each parameter group

    // Check sort options
    expect(result.sortOptions).toHaveProperty('createdAt');
    expect(result.sortOptions.createdAt).toBe(-1); // desc = -1

    // Check pagination
    expect(result.skip).toBe(0); // (page - 1) * pageSize
    expect(result.limit).toBe(20);
  });

  it('should build a query with custom parameters', () => {
    const result = buildMongoQuery('React', 'TypeScript', 'senior', 'question', 'asc', 3, 10);

    // Check filter
    expect(result.filter).toHaveProperty('$and');
    expect(result.filter.$and).toBeInstanceOf(Array);
    expect(result.filter.$and.length).toBe(3); // One for each parameter group

    // Find the topic condition
    const topicCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.topic)
    );
    expect(topicCondition).toBeDefined();
    expect(topicCondition.$or[0].topic.$regex).toBeInstanceOf(RegExp);
    expect(topicCondition.$or[0].topic.$regex.source).toBe('React');

    // Find the language condition
    const languageCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.language)
    );
    expect(languageCondition).toBeDefined();
    expect(languageCondition.$or[0].language.$regex).toBeInstanceOf(RegExp);
    expect(languageCondition.$or[0].language.$regex.source).toBe('TypeScript');

    // Find the position condition
    const positionCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.position)
    );
    expect(positionCondition).toBeDefined();
    expect(positionCondition.$or[0].position.$regex).toBeInstanceOf(RegExp);
    expect(positionCondition.$or[0].position.$regex.source).toBe('^senior$');

    // Check sort options
    expect(result.sortOptions).toHaveProperty('question');
    expect(result.sortOptions.question).toBe(1); // asc = 1

    // Check pagination
    expect(result.skip).toBe(20); // (3 - 1) * 10
    expect(result.limit).toBe(10);
  });

  it('should handle case-insensitive search', () => {
    const result = buildMongoQuery(
      'javascript',
      'javascript',
      'junior',
      'createdAt',
      'desc',
      1,
      20
    );

    // Find the topic condition
    const topicCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.topic)
    );
    expect(topicCondition.$or[0].topic.$regex.flags).toBe('i');

    // Find the language condition
    const languageCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.language)
    );
    expect(languageCondition.$or[0].language.$regex.flags).toBe('i');

    // Find the position condition
    const positionCondition = result.filter.$and.find(
      condition => condition.$or && condition.$or.some(orCond => orCond.position)
    );
    expect(positionCondition.$or[0].position.$regex.flags).toBe('i');
  });

  it('should handle different sort directions', () => {
    // Test ascending sort
    let result = buildMongoQuery('JavaScript', 'JavaScript', 'junior', 'category', 'asc', 1, 20);

    expect(result.sortOptions.category).toBe(1); // asc = 1

    // Test descending sort
    result = buildMongoQuery('JavaScript', 'JavaScript', 'junior', 'category', 'desc', 1, 20);

    expect(result.sortOptions.category).toBe(-1); // desc = -1
  });

  it('should calculate pagination correctly', () => {
    // Test first page
    let result = buildMongoQuery('JavaScript', 'JavaScript', 'junior', 'createdAt', 'desc', 1, 20);

    expect(result.skip).toBe(0);
    expect(result.limit).toBe(20);

    // Test second page
    result = buildMongoQuery('JavaScript', 'JavaScript', 'junior', 'createdAt', 'desc', 2, 20);

    expect(result.skip).toBe(20);
    expect(result.limit).toBe(20);

    // Test with different page size
    result = buildMongoQuery('JavaScript', 'JavaScript', 'junior', 'createdAt', 'desc', 3, 10);

    expect(result.skip).toBe(20); // (3 - 1) * 10
    expect(result.limit).toBe(10);
  });
});
