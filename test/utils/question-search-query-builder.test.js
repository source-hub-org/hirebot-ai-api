/**
 * Tests for the Question Search Query Builder utility
 */

const { buildMongoQuery } = require('../../src/utils/questionSearchQueryBuilder');

describe('questionSearchQueryBuilder', () => {
  describe('buildMongoQuery', () => {
    test('should return empty filter when no search parameters are provided', () => {
      const result = buildMongoQuery(
        undefined, // topic
        undefined, // language
        undefined, // position
        'createdAt', // sort_by
        'desc', // sort_direction
        1, // page
        10 // pageSize
      );

      expect(result.filter).toEqual({});
      expect(result.sortOptions).toEqual({ createdAt: -1 });
      expect(result.skip).toBe(0);
      expect(result.limit).toBe(10);
    });

    test('should build filter with single topic', () => {
      const result = buildMongoQuery(
        'JavaScript',
        undefined,
        undefined,
        'createdAt',
        'desc',
        1,
        10
      );

      expect(result.filter).toHaveProperty('topic');
      expect(result.filter.topic).toHaveProperty('$regex');
      expect(result.filter.topic.$regex).toBeInstanceOf(RegExp);
      expect(result.filter.topic.$regex.toString()).toMatch(/JavaScript/i);
    });

    test('should build filter with multiple topics', () => {
      const result = buildMongoQuery(
        'JavaScript,React,Node.js',
        undefined,
        undefined,
        'createdAt',
        'desc',
        1,
        10
      );

      expect(result.filter).toHaveProperty('topic');
      expect(result.filter.topic).toHaveProperty('$in');
      expect(result.filter.topic.$in).toHaveLength(3);
      expect(result.filter.topic.$in[0]).toBeInstanceOf(RegExp);
      expect(result.filter.topic.$in[0].source).toEqual('JavaScript');
      expect(result.filter.topic.$in[1].source).toEqual('React');
      expect(result.filter.topic.$in[2].source).toEqual('Node\\.js');
    });

    test('should build filter with single language', () => {
      const result = buildMongoQuery(undefined, 'Python', undefined, 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('language');
      expect(result.filter.language).toHaveProperty('$regex');
      expect(result.filter.language.$regex).toBeInstanceOf(RegExp);
      expect(result.filter.language.$regex.toString()).toMatch(/Python/i);
    });

    test('should build filter with multiple languages', () => {
      const result = buildMongoQuery(
        undefined,
        'Python,Java,C++',
        undefined,
        'createdAt',
        'desc',
        1,
        10
      );

      expect(result.filter).toHaveProperty('language');
      expect(result.filter.language).toHaveProperty('$in');
      expect(result.filter.language.$in).toHaveLength(3);
      expect(result.filter.language.$in[0]).toBeInstanceOf(RegExp);
      expect(result.filter.language.$in[0].source).toEqual('Python');
      expect(result.filter.language.$in[1].source).toEqual('Java');
      expect(result.filter.language.$in[2].source).toEqual('C\\+\\+');
    });

    test('should build filter with single position', () => {
      const result = buildMongoQuery(undefined, undefined, 'junior', 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('position');
      expect(result.filter.position).toHaveProperty('$regex');
      expect(result.filter.position.$regex).toBeInstanceOf(RegExp);
      expect(result.filter.position.$regex.source).toEqual('^junior$');
    });

    test('should build filter with multiple positions', () => {
      const result = buildMongoQuery(
        undefined,
        undefined,
        'junior,middle,senior',
        'createdAt',
        'desc',
        1,
        10
      );

      expect(result.filter).toHaveProperty('position');
      expect(result.filter.position).toHaveProperty('$in');
      expect(result.filter.position.$in).toHaveLength(3);
      expect(result.filter.position.$in[0]).toBeInstanceOf(RegExp);
      expect(result.filter.position.$in[0].source).toEqual('^junior$');
      expect(result.filter.position.$in[1].source).toEqual('^middle$');
      expect(result.filter.position.$in[2].source).toEqual('^senior$');
    });

    test('should build filter with all parameters', () => {
      const result = buildMongoQuery('JavaScript', 'Python', 'junior', 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('topic');
      expect(result.filter).toHaveProperty('language');
      expect(result.filter).toHaveProperty('position');
    });

    test('should handle whitespace in comma-separated values', () => {
      const result = buildMongoQuery(
        ' JavaScript , React ',
        ' Python , Java ',
        ' junior , senior ',
        'createdAt',
        'desc',
        1,
        10
      );

      expect(result.filter.topic.$in[0].source).toEqual('JavaScript');
      expect(result.filter.topic.$in[1].source).toEqual('React');
      expect(result.filter.language.$in[0].source).toEqual('Python');
      expect(result.filter.language.$in[1].source).toEqual('Java');
      expect(result.filter.position.$in[0].source).toEqual('^junior$');
      expect(result.filter.position.$in[1].source).toEqual('^senior$');
    });

    test('should set sortOptions to null for random sorting', () => {
      const result = buildMongoQuery(undefined, undefined, undefined, 'random', 'desc', 1, 10);

      expect(result.sortOptions).toBeNull();
    });

    test('should build ascending sort options', () => {
      const result = buildMongoQuery(undefined, undefined, undefined, 'topic', 'asc', 1, 10);

      expect(result.sortOptions).toEqual({ topic: 1 });
    });

    test('should build descending sort options', () => {
      const result = buildMongoQuery(undefined, undefined, undefined, 'language', 'desc', 1, 10);

      expect(result.sortOptions).toEqual({ language: -1 });
    });

    test('should calculate correct pagination parameters', () => {
      // Page 1, 10 items per page
      let result = buildMongoQuery(undefined, undefined, undefined, 'createdAt', 'desc', 1, 10);
      expect(result.skip).toBe(0);
      expect(result.limit).toBe(10);

      // Page 2, 10 items per page
      result = buildMongoQuery(undefined, undefined, undefined, 'createdAt', 'desc', 2, 10);
      expect(result.skip).toBe(10);
      expect(result.limit).toBe(10);

      // Page 3, 20 items per page
      result = buildMongoQuery(undefined, undefined, undefined, 'createdAt', 'desc', 3, 20);
      expect(result.skip).toBe(40);
      expect(result.limit).toBe(20);
    });
  });
});
