/**
 * Submission Controllers Logic Questions Tests
 */

const { ObjectId } = require('mongodb');
const {
  createSubmission,
} = require('../../../src/controllers/submissions/createSubmissionController');
const submissionRepository = require('../../../src/repository/submissionRepository');
const submissionValidator = require('../../../src/utils/submissionValidator');

// Mock dependencies
jest.mock('../../../src/repository/submissionRepository');
jest.mock('../../../src/repository/baseRepository');
jest.mock('../../../src/utils/submissionValidator');
jest.mock('../../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Controllers - Logic Questions', () => {
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

  describe('createSubmission with logic questions', () => {
    test('should create a submission with logic questions', async () => {
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
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
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
      submissionRepository.logicQuestionsExist.mockResolvedValue({
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
      expect(submissionRepository.logicQuestionsExist).toHaveBeenCalledWith([
        '507f1f77bcf86cd799439015',
      ]);
    });

    test('should reject a submission with non-existent logic questions', async () => {
      // Mock data
      req.body = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
            is_skip: 0,
          },
        ],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.logicQuestionsExist.mockResolvedValue({
        exists: false,
        missingIds: ['507f1f77bcf86cd799439015'],
      });

      // Execute
      await createSubmission(req, res);

      // Verify
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Logic questions not found',
        details: 'The following logic question IDs do not exist: 507f1f77bcf86cd799439015',
      });
    });

    test('should reject a submission with invalid logic question data', async () => {
      // Mock data
      req.body = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            point: -5, // Invalid negative value
            is_skip: 0,
          },
        ],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: false,
        errors: [
          'Invalid point value in logic_questions[0]. Must be a number greater than or equal to 0',
        ],
      });

      // Execute
      await createSubmission(req, res);

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
