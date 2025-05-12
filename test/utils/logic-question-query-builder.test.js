/**
 * Tests for the Logic Question Query Builder
 */

const mongoose = require('mongoose');
const { Types } = mongoose;
const { ObjectId } = Types;
const {
  parseObjectIds,
  buildFilter,
  buildSortOptions,
  buildPaginationOptions,
} = require('../../src/utils/logicQuestionQueryBuilder');
const { isValidObjectId } = require('../../src/utils/validateObjectId');

// Mock dependencies
jest.mock('../../src/utils/validateObjectId', () => ({
  isValidObjectId: jest.fn(),
}));

jest.mock('../../src/utils/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

describe('Logic Question Query Builder', () => {
  // Valid MongoDB ObjectId for testing
  const validObjectId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation for isValidObjectId
    isValidObjectId.mockImplementation(id => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    });
  });

  describe('parseObjectIds', () => {
    it('should return an empty array for null or undefined input', () => {
      expect(parseObjectIds(null)).toEqual([]);
      expect(parseObjectIds(undefined)).toEqual([]);
    });

    it('should return an empty array for non-string input', () => {
      expect(parseObjectIds(123)).toEqual([]);
      expect(parseObjectIds({})).toEqual([]);
      expect(parseObjectIds([])).toEqual([]);
    });

    it('should parse a comma-separated string of valid ObjectIds', () => {
      const idsString = `${validObjectId},${validObjectId}`;
      const result = parseObjectIds(idsString);

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(result[1]).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(result[0].toString()).toBe(validObjectId);
      expect(result[1].toString()).toBe(validObjectId);
    });

    it('should filter out invalid ObjectIds', () => {
      const idsString = `${validObjectId},invalid-id,${validObjectId}`;
      isValidObjectId.mockImplementation(id => id === validObjectId);

      const result = parseObjectIds(idsString);

      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe(validObjectId);
      expect(result[1].toString()).toBe(validObjectId);
    });

    it('should handle whitespace in the input string', () => {
      const idsString = ` ${validObjectId} , ${validObjectId} `;

      const result = parseObjectIds(idsString);

      expect(result).toHaveLength(2);
      expect(result[0].toString()).toBe(validObjectId);
      expect(result[1].toString()).toBe(validObjectId);
    });

    it('should return an empty array if all IDs are invalid', () => {
      isValidObjectId.mockReturnValue(false);

      const result = parseObjectIds('invalid1,invalid2');

      expect(result).toHaveLength(0);
    });

    it('should handle errors and return an empty array', () => {
      // Create a spy on the logger.warn method
      const warnSpy = jest.spyOn(require('../../src/utils/logger'), 'warn');

      // Create a spy on the split method that throws an error
      const originalSplit = String.prototype.split;
      String.prototype.split = jest.fn().mockImplementation(() => {
        throw new Error('Test error');
      });

      const result = parseObjectIds(validObjectId);

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();

      // Restore original implementation
      String.prototype.split = originalSplit;
      warnSpy.mockRestore();
    });
  });

  describe('buildFilter', () => {
    it('should return an empty filter object for empty query params', () => {
      const result = buildFilter({});
      expect(result).toEqual({});
    });

    it('should apply level filter for valid level values', () => {
      const result1 = buildFilter({ level: '3' });
      expect(result1).toEqual({ level: 3 });

      const result2 = buildFilter({ level: 4 });
      expect(result2).toEqual({ level: 4 });
    });

    it('should not apply level filter for invalid level values', () => {
      const result1 = buildFilter({ level: '0' });
      expect(result1).toEqual({});

      const result2 = buildFilter({ level: '7' });
      expect(result2).toEqual({});

      const result3 = buildFilter({ level: 'abc' });
      expect(result3).toEqual({});
    });

    it('should apply tag filter for valid tag_id', () => {
      isValidObjectId.mockReturnValue(true);

      const result = buildFilter({ tag_id: validObjectId });

      expect(result).toHaveProperty('tag_ids');
      expect(result.tag_ids).toHaveProperty('$in');
      expect(result.tag_ids.$in).toHaveLength(1);
      expect(result.tag_ids.$in[0]).toBeInstanceOf(ObjectId);
      expect(isValidObjectId).toHaveBeenCalledWith(validObjectId);
    });

    it('should not apply tag filter for invalid tag_id', () => {
      isValidObjectId.mockReturnValue(false);

      const result = buildFilter({ tag_id: 'invalid-id' });

      expect(result).toEqual({});
      expect(isValidObjectId).toHaveBeenCalledWith('invalid-id');
    });

    it('should apply type filter for valid question types', () => {
      const result1 = buildFilter({ type: 'multiple_choice' });
      expect(result1).toEqual({ type: 'multiple_choice' });

      const result2 = buildFilter({ type: 'open_question' });
      expect(result2).toEqual({ type: 'open_question' });
    });

    it('should not apply type filter for invalid question types', () => {
      const result = buildFilter({ type: 'invalid_type' });
      expect(result).toEqual({});
    });

    it('should apply ignore_question_ids filter for valid IDs', () => {
      // Mock parseObjectIds to return array of ObjectIds
      const mockObjectIds = [new ObjectId(validObjectId), new ObjectId(validObjectId)];

      // Create a mock implementation for parseObjectIds
      const originalParseObjectIds = parseObjectIds;

      // Replace the original function with our mock
      const mockFn = jest.fn().mockReturnValue(mockObjectIds);
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = mockFn;

      const result = buildFilter({ ignore_question_ids: `${validObjectId},${validObjectId}` });

      expect(result).toEqual({ _id: { $nin: mockObjectIds } });

      // Restore original implementation
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = originalParseObjectIds;
    });

    it('should not apply ignore_question_ids filter if no valid IDs are found', () => {
      // Mock parseObjectIds to return empty array
      const originalParseObjectIds = parseObjectIds;

      // Replace the original function with our mock
      const mockFn = jest.fn().mockReturnValue([]);
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = mockFn;

      const result = buildFilter({ ignore_question_ids: 'invalid-ids' });

      expect(result).toEqual({});

      // Restore original implementation
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = originalParseObjectIds;
    });

    it('should combine multiple filters correctly', () => {
      isValidObjectId.mockReturnValue(true);

      // Mock parseObjectIds to return array of ObjectIds
      const mockObjectIds = [new ObjectId(validObjectId)];
      const originalParseObjectIds = parseObjectIds;

      // Replace the original function with our mock
      const mockFn = jest.fn().mockReturnValue(mockObjectIds);
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = mockFn;

      const result = buildFilter({
        level: '2',
        tag_id: validObjectId,
        type: 'multiple_choice',
        ignore_question_ids: validObjectId,
      });

      // Check each property individually
      expect(result.level).toBe(2);
      expect(result.tag_ids).toHaveProperty('$in');
      expect(result.tag_ids.$in).toHaveLength(1);
      expect(result.tag_ids.$in[0]).toBeInstanceOf(ObjectId);
      expect(result.type).toBe('multiple_choice');
      expect(result._id).toEqual({ $nin: mockObjectIds });

      // Restore original implementation
      require('../../src/utils/logicQuestionQueryBuilder').parseObjectIds = originalParseObjectIds;
    });
  });

  describe('buildSortOptions', () => {
    it('should return null for random sorting', () => {
      const result = buildSortOptions({ sort_by: 'random' });
      expect(result).toBeNull();
    });

    it('should use specified sort field and direction', () => {
      const result1 = buildSortOptions({ sort_by: 'level', sort_direction: 'asc' });
      expect(result1).toEqual({ level: 1 });

      const result2 = buildSortOptions({ sort_by: 'createdAt', sort_direction: 'desc' });
      expect(result2).toEqual({ createdAt: -1 });
    });

    it('should default to descending order if sort_direction is not specified', () => {
      const result = buildSortOptions({ sort_by: 'level' });
      expect(result).toEqual({ level: -1 });
    });

    it('should default to sorting by createdAt if sort_by is not specified', () => {
      const result1 = buildSortOptions({ sort_direction: 'asc' });
      expect(result1).toEqual({ createdAt: 1 });

      const result2 = buildSortOptions({ sort_direction: 'desc' });
      expect(result2).toEqual({ createdAt: -1 });

      const result3 = buildSortOptions({});
      expect(result3).toEqual({ createdAt: -1 });
    });
  });

  describe('buildPaginationOptions', () => {
    it('should calculate pagination options correctly', () => {
      const result1 = buildPaginationOptions({ page: '2', limit: '10' });
      expect(result1).toEqual({ page: 2, limit: 10, skip: 10 });

      const result2 = buildPaginationOptions({ page: 3, limit: 15 });
      expect(result2).toEqual({ page: 3, limit: 15, skip: 30 });
    });

    it('should use default values if parameters are not provided', () => {
      const result1 = buildPaginationOptions({});
      expect(result1).toEqual({ page: 1, limit: 10, skip: 0 });

      const result2 = buildPaginationOptions({ page: 'invalid' });
      expect(result2).toEqual({ page: 1, limit: 10, skip: 0 });

      const result3 = buildPaginationOptions({ limit: 'invalid' });
      expect(result3).toEqual({ page: 1, limit: 10, skip: 0 });
    });

    it('should handle string and number inputs', () => {
      const result1 = buildPaginationOptions({ page: '2', limit: '20' });
      expect(result1).toEqual({ page: 2, limit: 20, skip: 20 });

      const result2 = buildPaginationOptions({ page: 2, limit: 20 });
      expect(result2).toEqual({ page: 2, limit: 20, skip: 20 });
    });
  });
});
