/**
 * Submission Controllers Logic Questions Update Tests
 */

const { ObjectId } = require('mongodb');
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

describe('Submission Controllers - Logic Questions Update', () => {
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

  describe('updateSubmission with logic questions', () => {
    test('should update a submission with logic questions', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      req.params = { id: submissionId };
      req.body = {
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
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
        logic_questions: [],
      };

      const updatedSubmission = {
        ...existingSubmission,
        logic_questions: req.body.logic_questions,
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
      submissionRepository.logicQuestionsExist.mockResolvedValue({
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
      expect(submissionRepository.logicQuestionsExist).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439015',
      ]);
    });

    test('should reject an update with non-existent logic questions', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      req.params = { id: submissionId };
      req.body = {
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
            is_skip: 0,
          },
        ],
      };

      const existingSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [],
        logic_questions: [],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById.mockResolvedValue(existingSubmission);
      submissionValidator.sanitizeUpdateData.mockReturnValue(req.body);
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.logicQuestionsExist.mockResolvedValue({
        exists: false,
        missingIds: ['507f1f77bcf86cd799439015'],
      });

      // Execute
      await updateSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Logic questions not found',
        details: 'The following logic question IDs do not exist: 507f1f77bcf86cd799439015',
      });
    });

    test('should reject an update with invalid logic question data', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      req.params = { id: submissionId };
      req.body = {
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            point: -10, // Invalid negative value
            is_skip: 0,
          },
        ],
      };

      const existingSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [],
        logic_questions: [],
      };

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById.mockResolvedValue(existingSubmission);
      submissionValidator.sanitizeUpdateData.mockReturnValue(req.body);
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: false,
        errors: [
          'Invalid point value in logic_questions[0]. Must be a number greater than or equal to 0',
        ],
      });

      // Execute
      await updateSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        details: [
          'Invalid point value in logic_questions[0]. Must be a number greater than or equal to 0',
        ],
      });
    });
  });
});
