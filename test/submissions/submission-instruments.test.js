/**
 * Submission Instruments Tests
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../../src/repository/baseRepository');
const submissionRepository = require('../../src/repository/submissionRepository');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Instruments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('instrumentsExist', () => {
    test('should return true when all instruments exist', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const instruments = [
        { _id: new ObjectId(instrumentIds[0]) },
        { _id: new ObjectId(instrumentIds[1]) },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(instruments);

      // Execute
      const result = await submissionRepository.instrumentsExist(instrumentIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith('instruments', {
        _id: { $in: expect.any(Array) },
      });
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should return false when some instruments do not exist', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const instruments = [{ _id: new ObjectId(instrumentIds[0]) }];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(instruments);

      // Execute
      const result = await submissionRepository.instrumentsExist(instrumentIds);

      // Verify
      expect(result).toEqual({
        exists: false,
        missingIds: [instrumentIds[1]],
      });
    });

    test('should return true for empty instrument IDs array', async () => {
      // Execute
      const result = await submissionRepository.instrumentsExist([]);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should filter out invalid ObjectIds', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011', 'invalid-id'];
      const instruments = [{ _id: new ObjectId(instrumentIds[0]) }];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockImplementation(id => id === instrumentIds[0]);
      baseRepository.findMany.mockResolvedValue(instruments);

      // Execute
      const result = await submissionRepository.instrumentsExist(instrumentIds);

      // Verify
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should handle all invalid ObjectIds', async () => {
      // Mock data
      const instrumentIds = ['invalid-id-1', 'invalid-id-2'];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await submissionRepository.instrumentsExist(instrumentIds);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({
        exists: false,
        missingIds: instrumentIds,
      });
    });

    test('should propagate errors from the database', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011'];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(submissionRepository.instrumentsExist(instrumentIds)).rejects.toThrow(
        'Database error'
      );
    });
  });
});
