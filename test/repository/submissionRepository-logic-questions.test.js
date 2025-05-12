/**
 * Submission Repository Logic Questions Tests
 */

const { ObjectId } = require('mongodb');
const { logicQuestionsExist } = require('../../src/repository/submissionRepository');
const baseRepository = require('../../src/repository/baseRepository');
const logger = require('../../src/utils/logger');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Repository - Logic Questions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logicQuestionsExist', () => {
    test('should return true when all logic questions exist', async () => {
      const logicQuestionIds = ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'];
      const mockLogicQuestions = [
        { _id: new ObjectId('507f1f77bcf86cd799439015') },
        { _id: new ObjectId('507f1f77bcf86cd799439016') },
      ];

      baseRepository.findMany.mockResolvedValue(mockLogicQuestions);

      const result = await logicQuestionsExist(logicQuestionIds);

      expect(result.exists).toBe(true);
      expect(result.missingIds).toEqual([]);
      expect(baseRepository.findMany).toHaveBeenCalledWith('logic_questions', {
        _id: { $in: expect.any(Array) },
      });
    });

    test('should return false when some logic questions do not exist', async () => {
      const logicQuestionIds = ['507f1f77bcf86cd799439015', '507f1f77bcf86cd799439016'];
      const mockLogicQuestions = [
        { _id: new ObjectId('507f1f77bcf86cd799439015') },
        // Second logic question not found
      ];

      baseRepository.findMany.mockResolvedValue(mockLogicQuestions);

      const result = await logicQuestionsExist(logicQuestionIds);

      expect(result.exists).toBe(false);
      expect(result.missingIds).toContain('507f1f77bcf86cd799439016');
    });

    test('should return true for empty logic question IDs array', async () => {
      const result = await logicQuestionsExist([]);

      expect(result.exists).toBe(true);
      expect(result.missingIds).toEqual([]);
      expect(baseRepository.findMany).not.toHaveBeenCalled();
    });

    test('should return false for invalid logic question IDs', async () => {
      const logicQuestionIds = ['invalid-id'];

      const result = await logicQuestionsExist(logicQuestionIds);

      expect(result.exists).toBe(false);
      expect(result.missingIds).toEqual(['invalid-id']);
      expect(baseRepository.findMany).not.toHaveBeenCalled();
    });

    test('should handle null or undefined logic question IDs', async () => {
      const result = await logicQuestionsExist(null);

      expect(result.exists).toBe(true);
      expect(result.missingIds).toEqual([]);
      expect(baseRepository.findMany).not.toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const logicQuestionIds = ['507f1f77bcf86cd799439015'];
      const error = new Error('Database error');

      baseRepository.findMany.mockRejectedValue(error);

      await expect(logicQuestionsExist(logicQuestionIds)).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalled();
    });
  });
});
