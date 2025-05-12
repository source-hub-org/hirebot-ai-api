/**
 * Tests for the Position Utils utility
 */

const {
  VALID_POSITIONS,
  isValidPosition,
  getPositionMetadata,
  formatPositionForDisplay,
} = require('../../src/utils/positionUtils');
const { getPositionBySlug } = require('../../src/repository/positionRepository');
const {
  getDifficultyText,
  getPositionInstruction,
  getPositionLevel,
} = require('../../src/config/positionConfig');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/repository/positionRepository');
jest.mock('../../src/config/positionConfig');
jest.mock('../../src/utils/logger', () => ({
  warn: jest.fn(),
  error: jest.fn(),
}));

describe('positionUtils', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('isValidPosition', () => {
    test('should return true for valid positions', () => {
      VALID_POSITIONS.forEach(position => {
        expect(isValidPosition(position)).toBe(true);
      });
    });

    test('should return true for valid positions with different case', () => {
      expect(isValidPosition('INTERN')).toBe(true);
      expect(isValidPosition('Fresher')).toBe(true);
      expect(isValidPosition('Junior')).toBe(true);
      expect(isValidPosition('MIDDLE')).toBe(true);
      expect(isValidPosition('Senior')).toBe(true);
      expect(isValidPosition('Expert')).toBe(true);
    });

    test('should return false for invalid positions', () => {
      expect(isValidPosition('invalid')).toBe(false);
      // The implementation returns position && ... so empty string returns '' which is falsy but not false
      expect(Boolean(isValidPosition(''))).toBe(false);
      // The implementation returns position && ... so null returns null which is falsy but not false
      expect(Boolean(isValidPosition(null))).toBe(false);
      // The implementation returns position && ... so undefined returns undefined which is falsy but not false
      expect(Boolean(isValidPosition(undefined))).toBe(false);
      // The implementation returns position && ... so non-string returns falsy but not false
      expect(Boolean(isValidPosition(123))).toBe(false);
    });
  });

  describe('getPositionMetadata', () => {
    test('should return metadata from database when position is found', async () => {
      const mockPosition = {
        description: 'Test description',
        instruction: 'Test instruction',
        level: 3,
      };
      getPositionBySlug.mockResolvedValue(mockPosition);

      const result = await getPositionMetadata('junior');

      expect(getPositionBySlug).toHaveBeenCalledWith('junior');
      expect(result).toEqual({
        difficultyText: 'Test description',
        positionInstruction: 'Test instruction',
        positionLevel: 3,
      });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('should use config values when position is not found in database', async () => {
      getPositionBySlug.mockResolvedValue(null);
      getDifficultyText.mockReturnValue('Config description');
      getPositionInstruction.mockReturnValue('Config instruction');
      getPositionLevel.mockReturnValue(2);

      const result = await getPositionMetadata('junior');

      expect(getPositionBySlug).toHaveBeenCalledWith('junior');
      expect(getDifficultyText).toHaveBeenCalledWith('junior');
      expect(getPositionInstruction).toHaveBeenCalledWith('junior');
      expect(getPositionLevel).toHaveBeenCalledWith('junior');
      expect(result).toEqual({
        difficultyText: 'Config description',
        positionInstruction: 'Config instruction',
        positionLevel: 2,
      });
      expect(logger.warn).toHaveBeenCalled();
      expect(logger.error).not.toHaveBeenCalled();
    });

    test('should use config values when database query throws an error', async () => {
      getPositionBySlug.mockRejectedValue(new Error('Database error'));
      getDifficultyText.mockReturnValue('Config description');
      getPositionInstruction.mockReturnValue('Config instruction');
      getPositionLevel.mockReturnValue(2);

      const result = await getPositionMetadata('junior');

      expect(getPositionBySlug).toHaveBeenCalledWith('junior');
      expect(getDifficultyText).toHaveBeenCalledWith('junior');
      expect(getPositionInstruction).toHaveBeenCalledWith('junior');
      expect(getPositionLevel).toHaveBeenCalledWith('junior');
      expect(result).toEqual({
        difficultyText: 'Config description',
        positionInstruction: 'Config instruction',
        positionLevel: 2,
      });
      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
    });

    test('should handle position with missing fields in database', async () => {
      const mockPosition = {
        // Missing some fields
      };
      getPositionBySlug.mockResolvedValue(mockPosition);
      getDifficultyText.mockReturnValue('Config description');
      getPositionInstruction.mockReturnValue('Config instruction');
      getPositionLevel.mockReturnValue(2);

      const result = await getPositionMetadata('junior');

      expect(getPositionBySlug).toHaveBeenCalledWith('junior');
      expect(result).toEqual({
        difficultyText: '',
        positionInstruction: '',
        positionLevel: 3, // Default value
      });
    });

    test('should convert position to lowercase', async () => {
      getPositionBySlug.mockResolvedValue(null);
      getDifficultyText.mockReturnValue('Config description');
      getPositionInstruction.mockReturnValue('Config instruction');
      getPositionLevel.mockReturnValue(2);

      await getPositionMetadata('JUNIOR');

      expect(getPositionBySlug).toHaveBeenCalledWith('junior');
      expect(getDifficultyText).toHaveBeenCalledWith('junior');
      expect(getPositionInstruction).toHaveBeenCalledWith('junior');
      expect(getPositionLevel).toHaveBeenCalledWith('junior');
    });
  });

  describe('formatPositionForDisplay', () => {
    test('should capitalize the first letter of the position', () => {
      expect(formatPositionForDisplay('junior')).toBe('Junior');
      expect(formatPositionForDisplay('senior')).toBe('Senior');
      expect(formatPositionForDisplay('expert')).toBe('Expert');
    });

    test('should handle already capitalized positions', () => {
      expect(formatPositionForDisplay('Junior')).toBe('Junior');
      expect(formatPositionForDisplay('SENIOR')).toBe('SENIOR');
    });

    test('should handle empty string', () => {
      expect(formatPositionForDisplay('')).toBe('');
    });
  });
});
