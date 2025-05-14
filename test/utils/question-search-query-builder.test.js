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

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const topicCondition = result.filter.$and[0];
      expect(topicCondition).toHaveProperty('$or');
      expect(topicCondition.$or).toBeInstanceOf(Array);
      expect(topicCondition.$or.length).toBe(1);

      const topicRegexCondition = topicCondition.$or[0];
      expect(topicRegexCondition).toHaveProperty('topic');
      expect(topicRegexCondition.topic).toHaveProperty('$regex');
      expect(topicRegexCondition.topic.$regex).toBeInstanceOf(RegExp);
      expect(topicRegexCondition.topic.$regex.toString()).toMatch(/JavaScript/i);
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

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const topicCondition = result.filter.$and[0];
      expect(topicCondition).toHaveProperty('$or');
      expect(topicCondition.$or).toBeInstanceOf(Array);
      expect(topicCondition.$or.length).toBe(1);

      const topicInCondition = topicCondition.$or[0];
      expect(topicInCondition).toHaveProperty('topic');
      expect(topicInCondition.topic).toHaveProperty('$in');
      expect(topicInCondition.topic.$in).toHaveLength(3);
      expect(topicInCondition.topic.$in[0]).toBeInstanceOf(RegExp);
      expect(topicInCondition.topic.$in[0].source).toEqual('JavaScript');
      expect(topicInCondition.topic.$in[1].source).toEqual('React');
      expect(topicInCondition.topic.$in[2].source).toEqual('Node\\.js');
    });

    test('should build filter with single language', () => {
      const result = buildMongoQuery(undefined, 'Python', undefined, 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const languageCondition = result.filter.$and[0];
      expect(languageCondition).toHaveProperty('$or');
      expect(languageCondition.$or).toBeInstanceOf(Array);
      expect(languageCondition.$or.length).toBe(1);

      const languageRegexCondition = languageCondition.$or[0];
      expect(languageRegexCondition).toHaveProperty('language');
      expect(languageRegexCondition.language).toHaveProperty('$regex');
      expect(languageRegexCondition.language.$regex).toBeInstanceOf(RegExp);
      expect(languageRegexCondition.language.$regex.toString()).toMatch(/Python/i);
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

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const languageCondition = result.filter.$and[0];
      expect(languageCondition).toHaveProperty('$or');
      expect(languageCondition.$or).toBeInstanceOf(Array);
      expect(languageCondition.$or.length).toBe(1);

      const languageInCondition = languageCondition.$or[0];
      expect(languageInCondition).toHaveProperty('language');
      expect(languageInCondition.language).toHaveProperty('$in');
      expect(languageInCondition.language.$in).toHaveLength(3);
      expect(languageInCondition.language.$in[0]).toBeInstanceOf(RegExp);
      expect(languageInCondition.language.$in[0].source).toEqual('Python');
      expect(languageInCondition.language.$in[1].source).toEqual('Java');
      expect(languageInCondition.language.$in[2].source).toEqual('C\\+\\+');
    });

    test('should build filter with single position', () => {
      const result = buildMongoQuery(undefined, undefined, 'junior', 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const positionCondition = result.filter.$and[0];
      expect(positionCondition).toHaveProperty('$or');
      expect(positionCondition.$or).toBeInstanceOf(Array);
      expect(positionCondition.$or.length).toBe(1);

      const positionRegexCondition = positionCondition.$or[0];
      expect(positionRegexCondition).toHaveProperty('position');
      expect(positionRegexCondition.position).toHaveProperty('$regex');
      expect(positionRegexCondition.position.$regex).toBeInstanceOf(RegExp);
      expect(positionRegexCondition.position.$regex.source).toEqual('^junior$');
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

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(1);

      const positionCondition = result.filter.$and[0];
      expect(positionCondition).toHaveProperty('$or');
      expect(positionCondition.$or).toBeInstanceOf(Array);
      expect(positionCondition.$or.length).toBe(1);

      const positionInCondition = positionCondition.$or[0];
      expect(positionInCondition).toHaveProperty('position');
      expect(positionInCondition.position).toHaveProperty('$in');
      expect(positionInCondition.position.$in).toHaveLength(3);
      expect(positionInCondition.position.$in[0]).toBeInstanceOf(RegExp);
      expect(positionInCondition.position.$in[0].source).toEqual('^junior$');
      expect(positionInCondition.position.$in[1].source).toEqual('^middle$');
      expect(positionInCondition.position.$in[2].source).toEqual('^senior$');
    });

    test('should build filter with all parameters', () => {
      const result = buildMongoQuery('JavaScript', 'Python', 'junior', 'createdAt', 'desc', 1, 10);

      expect(result.filter).toHaveProperty('$and');
      expect(result.filter.$and).toBeInstanceOf(Array);
      expect(result.filter.$and.length).toBe(3); // One for each parameter group

      // Check that each parameter group has an $or condition
      result.filter.$and.forEach(condition => {
        expect(condition).toHaveProperty('$or');
        expect(condition.$or).toBeInstanceOf(Array);
      });
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

      // Find the topic condition
      const topicCondition = result.filter.$and.find(
        condition => condition.$or && condition.$or.some(orCond => orCond.topic)
      );
      expect(topicCondition).toBeDefined();
      expect(topicCondition.$or[0].topic.$in[0].source).toEqual('JavaScript');
      expect(topicCondition.$or[0].topic.$in[1].source).toEqual('React');

      // Find the language condition
      const languageCondition = result.filter.$and.find(
        condition => condition.$or && condition.$or.some(orCond => orCond.language)
      );
      expect(languageCondition).toBeDefined();
      expect(languageCondition.$or[0].language.$in[0].source).toEqual('Python');
      expect(languageCondition.$or[0].language.$in[1].source).toEqual('Java');

      // Find the position condition
      const positionCondition = result.filter.$and.find(
        condition => condition.$or && condition.$or.some(orCond => orCond.position)
      );
      expect(positionCondition).toBeDefined();
      expect(positionCondition.$or[0].position.$in[0].source).toEqual('^junior$');
      expect(positionCondition.$or[0].position.$in[1].source).toEqual('^senior$');
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
