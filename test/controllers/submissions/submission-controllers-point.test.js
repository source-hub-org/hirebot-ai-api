/**
 * Submission Controllers Point Field Tests
 */

const { ObjectId } = require('mongodb');
const {
  createSubmission,
} = require('../../../src/controllers/submissions/createSubmissionController');
const {
  updateSubmission,
} = require('../../../src/controllers/submissions/updateSubmissionController');
const submissionRepository = require('../../../src/repository/submissionRepository');
const submissionValidator = require('../../../src/utils/submissionValidator');
const baseRepository = require('../../../src/repository/baseRepository');

// Mock dependencies
jest.mock('../../../src/repository/submissionRepository');
jest.mock('../../../src/repository/baseRepository');
jest.mock('../../../src/utils/submissionValidator');
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Controllers - Point Field', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      params: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('createSubmission', () => {
    test('should create a submission with point fields', async () => {
      // Mock data
      req.body = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            point: 7.5,
            is_skip: 0,
          },
        ],
      };

      const createdSubmission = {
        _id: new ObjectId('507f1f77bcf86cd799439014'),
        ...req.body,
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.questionsExist.mockResolvedValue({
        exists: true,
        missingIds: [],
      });
      submissionRepository.instrumentsExist.mockResolvedValue({
        exists: true,
        missingIds: [],
      });
      submissionRepository.insertSubmissionToDB.mockResolvedValue(createdSubmission);

      // Execute
      await createSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdSubmission,
        message: 'Submission created successfully',
      });
      expect(submissionRepository.insertSubmissionToDB).toHaveBeenCalledWith(req.body);
    });

    test('should reject a submission with invalid point values', async () => {
      // Mock data
      req.body = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: -5, // Invalid negative value
            is_skip: 0,
          },
        ],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: false,
        errors: ['Invalid point value in answers[0]. Must be a number greater than or equal to 0'],
      });

      // Execute
      await createSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: ['Invalid point value in answers[0]. Must be a number greater than or equal to 0'],
      });
    });
  });

  describe('updateSubmission', () => {
    test('should update a submission with point fields', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      req.params = { id: submissionId };
      req.body = {
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 3,
            point: 8,
            is_skip: 0,
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 2,
            point: 6,
            is_skip: 0,
          },
        ],
      };

      const existingSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            point: 7.5,
            is_skip: 0,
          },
        ],
      };

      const updatedSubmission = {
        ...existingSubmission,
        ...req.body,
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById
        .mockResolvedValueOnce(existingSubmission)
        .mockResolvedValueOnce(updatedSubmission);
      submissionValidator.sanitizeUpdateData.mockReturnValue(req.body);
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.questionsExist.mockResolvedValue({
        exists: true,
        missingIds: [],
      });
      submissionRepository.instrumentsExist.mockResolvedValue({
        exists: true,
        missingIds: [],
      });
      baseRepository.updateOne.mockResolvedValue({ acknowledged: true });

      // Execute
      await updateSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedSubmission,
        message: 'Submission updated successfully',
      });
      expect(baseRepository.updateOne).toHaveBeenCalled();
    });

    test('should reject an update with invalid point values', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      req.params = { id: submissionId };
      req.body = {
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 3,
            point: -8, // Invalid negative value
            is_skip: 0,
          },
        ],
      };

      const existingSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
          },
        ],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById.mockResolvedValue(existingSubmission);
      submissionValidator.sanitizeUpdateData.mockReturnValue(req.body);
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: false,
        errors: ['Invalid point value in answers[0]. Must be a number greater than or equal to 0'],
      });

      // Execute
      await updateSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: ['Invalid point value in answers[0]. Must be a number greater than or equal to 0'],
      });
    });
  });
});
