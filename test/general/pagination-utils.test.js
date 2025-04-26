/**
 * Pagination Utilities Tests
 */

const {
  parsePaginationParams,
  calculatePaginationMetadata,
  calculateSkipValue,
  generatePaginationOptions,
} = require('../../src/utils/paginationUtils');

describe('Pagination Utilities', () => {
  describe('parsePaginationParams', () => {
    test('should parse valid pagination parameters', () => {
      const query = { page: '2', page_size: '30' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(30);
    });

    test('should apply default values for missing parameters', () => {
      const query = {};
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    test('should handle invalid page parameter', () => {
      const query = { page: 'invalid', page_size: '30' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1); // Default to 1
      expect(result.pageSize).toBe(30);
    });

    test('should handle negative page parameter', () => {
      const query = { page: '-5', page_size: '30' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(1); // Default to 1
      expect(result.pageSize).toBe(30);
    });

    test('should handle invalid page_size parameter', () => {
      const query = { page: '2', page_size: 'invalid' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20); // Default to 20
    });

    test('should clamp page_size to maximum of 100', () => {
      const query = { page: '2', page_size: '200' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(100); // Clamped to 100
    });

    test('should handle negative page_size parameter', () => {
      const query = { page: '2', page_size: '-30' };
      const result = parsePaginationParams(query);

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20); // Default to 20
    });
  });

  describe('calculatePaginationMetadata', () => {
    test('should calculate correct pagination metadata', () => {
      const result = calculatePaginationMetadata(100, 2, 20);

      expect(result.total).toBe(100);
      expect(result.page).toBe(2);
      expect(result.page_size).toBe(20);
      expect(result.total_pages).toBe(5);
    });

    test('should handle partial pages correctly', () => {
      const result = calculatePaginationMetadata(95, 2, 20);

      expect(result.total).toBe(95);
      expect(result.total_pages).toBe(5); // Ceiling of 95/20 = 4.75 = 5
    });

    test('should handle zero total items', () => {
      const result = calculatePaginationMetadata(0, 1, 20);

      expect(result.total).toBe(0);
      expect(result.total_pages).toBe(0);
    });
  });

  describe('calculateSkipValue', () => {
    test('should calculate correct skip value for first page', () => {
      const result = calculateSkipValue(1, 20);
      expect(result).toBe(0);
    });

    test('should calculate correct skip value for second page', () => {
      const result = calculateSkipValue(2, 20);
      expect(result).toBe(20);
    });

    test('should calculate correct skip value for arbitrary page and size', () => {
      const result = calculateSkipValue(5, 15);
      expect(result).toBe(60); // (5-1) * 15
    });
  });

  describe('generatePaginationOptions', () => {
    test('should generate correct MongoDB pagination options', () => {
      const result = generatePaginationOptions(3, 25);

      expect(result.skip).toBe(50); // (3-1) * 25
      expect(result.limit).toBe(25);
    });
  });
});
