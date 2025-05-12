/**
 * Tests for the Random Sorting Utils utility
 */

const { shuffleArray, getRandomDocuments } = require('../../src/utils/randomSortingUtils');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
}));

describe('randomSortingUtils', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('shuffleArray', () => {
    test('should return a new array with the same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = shuffleArray(original);

      // Should be a new array, not the same reference
      expect(shuffled).not.toBe(original);

      // Should contain the same elements
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled.sort()).toEqual(original.sort());
    });

    test('should not modify the original array', () => {
      const original = [1, 2, 3, 4, 5];
      const originalCopy = [...original];
      shuffleArray(original);

      expect(original).toEqual(originalCopy);
    });

    test('should handle empty arrays', () => {
      const original = [];
      const shuffled = shuffleArray(original);

      expect(shuffled).toEqual([]);
    });

    test('should handle arrays with one element', () => {
      const original = [1];
      const shuffled = shuffleArray(original);

      expect(shuffled).toEqual([1]);
    });

    test('should handle arrays with duplicate elements', () => {
      const original = [1, 2, 2, 3, 3, 3];
      const shuffled = shuffleArray(original);

      expect(shuffled.sort()).toEqual(original.sort());
    });

    // This test verifies that the array is actually being shuffled
    // Note: There's a very small chance this test could fail randomly
    test('should shuffle the elements (probabilistic test)', () => {
      // Use a larger array to reduce the chance of a false positive
      const original = Array.from({ length: 100 }, (_, i) => i);
      const shuffled = shuffleArray(original);

      // Check if at least some elements have changed position
      let samePositionCount = 0;
      for (let i = 0; i < original.length; i++) {
        if (original[i] === shuffled[i]) {
          samePositionCount++;
        }
      }

      // It's extremely unlikely that more than 20% of elements would remain in the same position
      expect(samePositionCount).toBeLessThan(original.length * 0.2);
    });
  });

  describe('getRandomDocuments', () => {
    // Mock collection for testing
    let mockCollection;

    beforeEach(() => {
      // Create a mock MongoDB collection
      mockCollection = {
        countDocuments: jest.fn(),
        find: jest.fn(),
        aggregate: jest.fn(),
      };

      // Set up default mock behavior
      mockCollection.countDocuments.mockResolvedValue(0);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
    });

    test('should return empty array when no documents match the filter', async () => {
      mockCollection.countDocuments.mockResolvedValue(0);

      const result = await getRandomDocuments(
        mockCollection,
        { status: 'active' },
        { skip: 0, limit: 10 }
      );

      expect(result).toEqual([]);
      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'active' });
      expect(mockCollection.find).not.toHaveBeenCalled();
      expect(mockCollection.aggregate).not.toHaveBeenCalled();
    });

    test('should use in-memory shuffling for small collections (<=1000 documents)', async () => {
      const mockDocuments = [
        { id: 1, name: 'Doc 1' },
        { id: 2, name: 'Doc 2' },
        { id: 3, name: 'Doc 3' },
        { id: 4, name: 'Doc 4' },
        { id: 5, name: 'Doc 5' },
      ];

      mockCollection.countDocuments.mockResolvedValue(5);
      mockCollection.find.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocuments),
      });

      // We can't easily mock the internal shuffleArray call inside getRandomDocuments
      // So we'll just verify that the right number of documents are returned
      const result = await getRandomDocuments(
        mockCollection,
        { status: 'active' },
        { skip: 1, limit: 2 }
      );

      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'active' });
      expect(mockCollection.find).toHaveBeenCalledWith({ status: 'active' });

      // Should return 2 documents after skipping 1
      expect(result).toHaveLength(2);
      // Verify these are documents from our mock data
      expect(result.every(doc => mockDocuments.some(mockDoc => mockDoc.id === doc.id))).toBe(true);
    });

    test('should use MongoDB $sample for large collections (>1000 documents)', async () => {
      const mockDocuments = [
        { id: 1, name: 'Doc 1' },
        { id: 2, name: 'Doc 2' },
      ];

      mockCollection.countDocuments.mockResolvedValue(1001);
      mockCollection.aggregate.mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockDocuments),
      });

      const result = await getRandomDocuments(
        mockCollection,
        { status: 'active' },
        { skip: 0, limit: 2 }
      );

      expect(mockCollection.countDocuments).toHaveBeenCalledWith({ status: 'active' });
      expect(mockCollection.find).not.toHaveBeenCalled();
      expect(mockCollection.aggregate).toHaveBeenCalledWith([
        { $match: { status: 'active' } },
        { $sample: { size: 2 } },
      ]);
      expect(result).toEqual(mockDocuments);
    });

    test('should handle errors and return empty array', async () => {
      mockCollection.countDocuments.mockRejectedValue(new Error('Database error'));

      const result = await getRandomDocuments(
        mockCollection,
        { status: 'active' },
        { skip: 0, limit: 10 }
      );

      expect(result).toEqual([]);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
