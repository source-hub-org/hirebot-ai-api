/**
 * Tests for the Instrument Query Builder utility
 */

const { ObjectId } = require('mongoose').Types;
const {
  buildMongoQuery,
  parseObjectIds,
  isValidObjectId,
} = require('../../src/utils/instrumentQueryBuilder');

describe('instrumentQueryBuilder', () => {
  describe('isValidObjectId', () => {
    test('should return true for valid ObjectId', () => {
      const validId = new ObjectId().toString();
      expect(isValidObjectId(validId)).toBe(true);
    });

    test('should return false for invalid ObjectId', () => {
      expect(isValidObjectId('invalid-id')).toBe(false);
      expect(isValidObjectId('')).toBe(false);
      expect(isValidObjectId(null)).toBe(false);
      expect(isValidObjectId(undefined)).toBe(false);
      expect(isValidObjectId(123)).toBe(false);
    });

    test('should return false when an error is thrown', () => {
      // Mock ObjectId.isValid to throw an error
      const originalIsValid = ObjectId.isValid;
      ObjectId.isValid = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      expect(isValidObjectId('some-id')).toBe(false);

      // Restore original function
      ObjectId.isValid = originalIsValid;
    });
  });

  describe('parseObjectIds', () => {
    test('should return empty array for empty input', () => {
      expect(parseObjectIds('')).toEqual([]);
      expect(parseObjectIds(null)).toEqual([]);
      expect(parseObjectIds(undefined)).toEqual([]);
    });

    test('should parse comma-separated ObjectIds', () => {
      const id1 = new ObjectId().toString();
      const id2 = new ObjectId().toString();
      const id3 = new ObjectId().toString();

      const result = parseObjectIds(`${id1},${id2},${id3}`);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(expect.any(ObjectId));
      expect(result[0].toString()).toBe(id1);
      expect(result[1].toString()).toBe(id2);
      expect(result[2].toString()).toBe(id3);
    });

    test('should filter out invalid ObjectIds', () => {
      const id1 = new ObjectId().toString();
      const id2 = 'invalid-id';
      const id3 = new ObjectId().toString();

      const result = parseObjectIds(`${id1},${id2},${id3}`);

      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe(id1);
      expect(result[1].toString()).toBe(id3);
    });

    test('should trim whitespace from IDs', () => {
      const id1 = new ObjectId().toString();
      const id2 = new ObjectId().toString();

      const result = parseObjectIds(` ${id1} , ${id2} `);

      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe(id1);
      expect(result[1].toString()).toBe(id2);
    });
  });

  describe('buildMongoQuery', () => {
    test('should return default query parameters when no input is provided', () => {
      const result = buildMongoQuery();

      expect(result).toEqual({
        filter: {},
        sortOptions: { createdAt: -1 },
        page: 1,
        limit: 10,
        skip: 0,
      });
    });

    test('should build filter with type', () => {
      const result = buildMongoQuery({ type: 'test-type' });

      expect(result.filter).toEqual({
        type: 'test-type',
      });
    });

    test('should build filter with tags', () => {
      const id1 = new ObjectId().toString();
      const id2 = new ObjectId().toString();

      const result = buildMongoQuery({ instrument_tags: `${id1},${id2}` });

      expect(result.filter).toHaveProperty('tags');
      expect(result.filter.tags).toHaveProperty('$in');
      expect(result.filter.tags.$in).toHaveLength(2);
      expect(result.filter.tags.$in[0].toString()).toBe(id1);
      expect(result.filter.tags.$in[1].toString()).toBe(id2);
    });

    test('should build filter with ignored instrument IDs', () => {
      const id1 = new ObjectId().toString();
      const id2 = new ObjectId().toString();

      const result = buildMongoQuery({ ignore_instrument_ids: `${id1},${id2}` });

      expect(result.filter).toHaveProperty('_id');
      expect(result.filter._id).toHaveProperty('$nin');
      expect(result.filter._id.$nin).toHaveLength(2);
      expect(result.filter._id.$nin[0].toString()).toBe(id1);
      expect(result.filter._id.$nin[1].toString()).toBe(id2);
    });

    test('should build filter with all parameters', () => {
      const tagId = new ObjectId().toString();
      const ignoreId = new ObjectId().toString();

      const result = buildMongoQuery({
        type: 'test-type',
        instrument_tags: tagId,
        ignore_instrument_ids: ignoreId,
      });

      expect(result.filter).toEqual({
        type: 'test-type',
        tags: { $in: [expect.any(ObjectId)] },
        _id: { $nin: [expect.any(ObjectId)] },
      });
      expect(result.filter.tags.$in[0].toString()).toBe(tagId);
      expect(result.filter._id.$nin[0].toString()).toBe(ignoreId);
    });

    test('should not add tags filter if no valid tag IDs are provided', () => {
      const result = buildMongoQuery({ instrument_tags: 'invalid-id' });

      expect(result.filter).not.toHaveProperty('tags');
    });

    test('should not add _id filter if no valid ignore IDs are provided', () => {
      const result = buildMongoQuery({ ignore_instrument_ids: 'invalid-id' });

      expect(result.filter).not.toHaveProperty('_id');
    });

    test('should return null for sortOptions when sort_by is "random"', () => {
      const result = buildMongoQuery({ sort_by: 'random' });

      expect(result.sortOptions).toBeNull();
    });

    test('should build sort options with custom field and direction', () => {
      const result = buildMongoQuery({ sort_by: 'name', sort_direction: 'asc' });

      expect(result.sortOptions).toEqual({ name: 1 });
    });

    test('should default to descending order when sort_direction is not "asc"', () => {
      const result = buildMongoQuery({ sort_by: 'name', sort_direction: 'invalid' });

      expect(result.sortOptions).toEqual({ name: -1 });
    });

    test('should build pagination options with custom page and limit', () => {
      const result = buildMongoQuery({ page: 3, limit: 20 });

      expect(result.page).toBe(3);
      expect(result.limit).toBe(20);
      expect(result.skip).toBe(40); // (3-1) * 20
    });

    test('should handle string values for page and limit', () => {
      const result = buildMongoQuery({ page: '2', limit: '15' });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(15);
      expect(result.skip).toBe(15); // (2-1) * 15
    });

    test('should use default pagination values for invalid inputs', () => {
      const result = buildMongoQuery({ page: 'invalid', limit: 'invalid' });

      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.skip).toBe(0);
    });
  });
});
