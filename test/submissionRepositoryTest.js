/**
 * Submission Repository Tests
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../src/repository/baseRepository');
const submissionRepository = require('../src/repository/submissionRepository');
const submissionValidator = require('../src/utils/submissionValidator');

// Mock dependencies
jest.mock('../src/repository/baseRepository');
jest.mock('../src/utils/submissionValidator');
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Repository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('insertSubmissionToDB', () => {
    test('should format and insert a submission successfully', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
      };

      const formattedSubmission = {
        ...submissionData,
        review: { status: 'submitted', comment: '' },
      };

      const insertResult = {
        acknowledged: true,
        insertedId: new ObjectId('507f1f77bcf86cd799439013'),
      };

      // Setup mocks
      submissionValidator.formatSubmissionDefaults.mockReturnValue(formattedSubmission);
      baseRepository.insertOne.mockResolvedValue(insertResult);

      // Execute
      const result = await submissionRepository.insertSubmissionToDB(submissionData);

      // Verify
      expect(submissionValidator.formatSubmissionDefaults).toHaveBeenCalledWith(submissionData);
      expect(baseRepository.insertOne).toHaveBeenCalledWith('submissions', formattedSubmission);
      expect(result).toEqual({
        _id: insertResult.insertedId,
        ...formattedSubmission,
      });
    });

    test('should throw an error if insertion fails', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
      };

      const formattedSubmission = {
        ...submissionData,
        review: { status: 'submitted', comment: '' },
      };

      const insertResult = {
        acknowledged: false,
      };

      // Setup mocks
      submissionValidator.formatSubmissionDefaults.mockReturnValue(formattedSubmission);
      baseRepository.insertOne.mockResolvedValue(insertResult);

      // Execute and verify
      await expect(submissionRepository.insertSubmissionToDB(submissionData)).rejects.toThrow(
        'Failed to insert submission'
      );
    });

    test('should propagate errors from the database', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
      };

      // Setup mocks
      submissionValidator.formatSubmissionDefaults.mockReturnValue(submissionData);
      baseRepository.insertOne.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(submissionRepository.insertSubmissionToDB(submissionData)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getSubmissionById', () => {
    test('should return a submission when found', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439011';
      const submission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(submission);

      // Execute
      const result = await submissionRepository.getSubmissionById(submissionId);

      // Verify
      expect(baseRepository.findOne).toHaveBeenCalledWith('submissions', {
        _id: expect.any(ObjectId),
      });
      expect(result).toEqual(submission);
    });

    test('should return null for invalid ObjectId', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await submissionRepository.getSubmissionById('invalid-id');

      // Verify
      expect(baseRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test('should propagate errors from the database', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(
        submissionRepository.getSubmissionById('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Database error');
    });
  });

  describe('getSubmissionsByCandidateId', () => {
    test('should return submissions for a candidate', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const submissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          candidate_id: candidateId,
          answers: [],
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(submissions);

      // Execute
      const result = await submissionRepository.getSubmissionsByCandidateId(candidateId);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith('submissions', {
        candidate_id: candidateId,
      });
      expect(result).toEqual(submissions);
    });

    test('should return empty array for invalid ObjectId', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await submissionRepository.getSubmissionsByCandidateId('invalid-id');

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test('should propagate errors from the database', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(
        submissionRepository.getSubmissionsByCandidateId('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Database error');
    });
  });

  describe('candidateExists', () => {
    test('should return true when candidate exists', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const candidate = {
        _id: new ObjectId(candidateId),
        full_name: 'John Doe',
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(candidate);

      // Execute
      const result = await submissionRepository.candidateExists(candidateId);

      // Verify
      expect(baseRepository.findOne).toHaveBeenCalledWith('candidates', {
        _id: expect.any(ObjectId),
      });
      expect(result).toBe(true);
    });

    test('should return false when candidate does not exist', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockResolvedValue(null);

      // Execute
      const result = await submissionRepository.candidateExists('507f1f77bcf86cd799439011');

      // Verify
      expect(result).toBe(false);
    });

    test('should return false for invalid ObjectId', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await submissionRepository.candidateExists('invalid-id');

      // Verify
      expect(baseRepository.findOne).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('should propagate errors from the database', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findOne.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(
        submissionRepository.candidateExists('507f1f77bcf86cd799439011')
      ).rejects.toThrow('Database error');
    });
  });

  describe('questionsExist', () => {
    test('should return true when all questions exist', async () => {
      // Mock data
      const questionIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const questions = [
        { _id: new ObjectId(questionIds[0]) },
        { _id: new ObjectId(questionIds[1]) },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(questions);

      // Execute
      const result = await submissionRepository.questionsExist(questionIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith('questions', {
        _id: { $in: expect.any(Array) },
      });
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should return false when some questions do not exist', async () => {
      // Mock data
      const questionIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const questions = [{ _id: new ObjectId(questionIds[0]) }];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(questions);

      // Execute
      const result = await submissionRepository.questionsExist(questionIds);

      // Verify
      expect(result).toEqual({
        exists: false,
        missingIds: [questionIds[1]],
      });
    });

    test('should return true for empty question IDs array', async () => {
      // Execute
      const result = await submissionRepository.questionsExist([]);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should filter out invalid ObjectIds', async () => {
      // Mock data
      const questionIds = ['507f1f77bcf86cd799439011', 'invalid-id'];
      const questions = [{ _id: new ObjectId(questionIds[0]) }];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockImplementation(id => id === questionIds[0]);
      baseRepository.findMany.mockResolvedValue(questions);

      // Execute
      const result = await submissionRepository.questionsExist(questionIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith('questions', {
        _id: { $in: [expect.any(ObjectId)] },
      });
      expect(result).toEqual({
        exists: true,
        missingIds: [],
      });
    });

    test('should return false when all ObjectIds are invalid', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(false);

      // Execute
      const result = await submissionRepository.questionsExist(['invalid-id-1', 'invalid-id-2']);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({
        exists: false,
        missingIds: ['invalid-id-1', 'invalid-id-2'],
      });
    });

    test('should propagate errors from the database', async () => {
      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockRejectedValue(new Error('Database error'));

      // Execute and verify
      await expect(
        submissionRepository.questionsExist(['507f1f77bcf86cd799439011'])
      ).rejects.toThrow('Database error');
    });
  });
});
