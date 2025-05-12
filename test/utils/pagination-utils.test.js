/**
 * Tests for the Pagination Utilities
 */

const {
  parsePaginationParams,
  calculatePaginationMetadata,
  calculateSkipValue,
  generatePaginationOptions,
} = require('../../src/utils/paginationUtils');

describe('Pagination Utilities', () => {
  describe('parsePaginationParams', () => {
    it('should parse valid pagination parameters', () => {
      const query = { page: '2', page_size: '30' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 2, pageSize: 30 });
    });

    it('should handle numeric parameters', () => {
      const query = { page: 3, page_size: 25 };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 3, pageSize: 25 });
    });

    it('should use default values for missing parameters', () => {
      const query = {};
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 1, pageSize: 20 });
    });

    it('should use default values for invalid parameters', () => {
      const query = { page: 'abc', page_size: 'xyz' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 1, pageSize: 20 });
    });

    it('should use default page value for negative page number', () => {
      const query = { page: '-5', page_size: '30' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 1, pageSize: 30 });
    });

    it('should use default page_size value for negative page_size', () => {
      const query = { page: '2', page_size: '-10' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 2, pageSize: 20 });
    });

    it('should cap page_size at 100', () => {
      const query = { page: '2', page_size: '200' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 2, pageSize: 100 });
    });

    it('should handle zero values as invalid', () => {
      const query = { page: '0', page_size: '0' };
      const result = parsePaginationParams(query);

      expect(result).toEqual({ page: 1, pageSize: 20 });
    });
  });

  describe('calculatePaginationMetadata', () => {
    it('should calculate metadata correctly', () => {
      const result = calculatePaginationMetadata(100, 2, 20);

      expect(result).toEqual({
        total: 100,
        page: 2,
        page_size: 20,
        total_pages: 5,
      });
    });

    it('should handle exact division', () => {
      const result = calculatePaginationMetadata(50, 1, 10);

      expect(result).toEqual({
        total: 50,
        page: 1,
        page_size: 10,
        total_pages: 5,
      });
    });

    it('should round up total_pages when division is not exact', () => {
      const result = calculatePaginationMetadata(55, 1, 10);

      expect(result).toEqual({
        total: 55,
        page: 1,
        page_size: 10,
        total_pages: 6,
      });
    });

    it('should handle zero total items', () => {
      const result = calculatePaginationMetadata(0, 1, 10);

      expect(result).toEqual({
        total: 0,
        page: 1,
        page_size: 10,
        total_pages: 0,
      });
    });
  });

  describe('calculateSkipValue', () => {
    it('should calculate skip value correctly for first page', () => {
      const result = calculateSkipValue(1, 20);
      expect(result).toBe(0);
    });

    it('should calculate skip value correctly for second page', () => {
      const result = calculateSkipValue(2, 20);
      expect(result).toBe(20);
    });

    it('should calculate skip value correctly for arbitrary page and page size', () => {
      const result = calculateSkipValue(5, 15);
      expect(result).toBe(60); // (5-1) * 15
    });
  });

  describe('generatePaginationOptions', () => {
    it('should generate correct MongoDB pagination options', () => {
      const result = generatePaginationOptions(3, 25);

      expect(result).toEqual({
        skip: 50, // (3-1) * 25
        limit: 25,
      });
    });

    it('should generate options for first page', () => {
      const result = generatePaginationOptions(1, 20);

      expect(result).toEqual({
        skip: 0,
        limit: 20,
      });
    });
  });
});
