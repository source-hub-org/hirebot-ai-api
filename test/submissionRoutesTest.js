/**
 * Submission Routes Tests
 */

const request = require('supertest');
const { app } = require('../src/index');
const submissionRepository = require('../src/repository/submissionRepository');
const submissionValidator = require('../src/utils/submissionValidator');

// Mock dependencies
jest.mock('../src/repository/submissionRepository');
jest.mock('../src/utils/submissionValidator');
jest.mock('../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/submissions', () => {
    test('should create a submission successfully', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            other: 'Some explanation',
            is_skip: 0,
          },
        ],
        essay: {
          question: 'Essay question',
          answer: 'Essay answer',
          is_skip: 0,
        },
      };

      const createdSubmission = {
        _id: '507f1f77bcf86cd799439013',
        ...submissionData,
        review: {
          status: 'submitted',
          comment: '',
        },
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
      submissionRepository.insertSubmissionToDB.mockResolvedValue(createdSubmission);

      // Execute
      const response = await request(app).post('/api/submissions').send(submissionData).expect(201);

      // Verify
      expect(submissionValidator.validateSubmissionInput).toHaveBeenCalledWith(submissionData);
      expect(submissionRepository.candidateExists).toHaveBeenCalledWith(
        submissionData.candidate_id
      );
      expect(submissionRepository.questionsExist).toHaveBeenCalledWith([
        submissionData.answers[0].question_id,
      ]);
      expect(submissionRepository.insertSubmissionToDB).toHaveBeenCalledWith(submissionData);
      expect(response.body).toEqual({
        success: true,
        data: createdSubmission,
        message: 'Submission created successfully',
      });
    });

    test('should return 400 for invalid input', async () => {
      // Mock data
      const invalidSubmission = {
        // Missing candidate_id
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
          },
        ],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: false,
        errors: ['Missing required field: candidate_id'],
      });

      // Execute
      const response = await request(app)
        .post('/api/submissions')
        .send(invalidSubmission)
        .expect(400);

      // Verify
      expect(submissionValidator.validateSubmissionInput).toHaveBeenCalledWith(invalidSubmission);
      expect(submissionRepository.candidateExists).not.toHaveBeenCalled();
      expect(submissionRepository.questionsExist).not.toHaveBeenCalled();
      expect(submissionRepository.insertSubmissionToDB).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: 'Validation failed',
        details: ['Missing required field: candidate_id'],
      });
    });

    test('should return 404 when candidate does not exist', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.candidateExists.mockResolvedValue(false);

      // Execute
      const response = await request(app).post('/api/submissions').send(submissionData).expect(404);

      // Verify
      expect(submissionValidator.validateSubmissionInput).toHaveBeenCalledWith(submissionData);
      expect(submissionRepository.candidateExists).toHaveBeenCalledWith(
        submissionData.candidate_id
      );
      expect(submissionRepository.questionsExist).not.toHaveBeenCalled();
      expect(submissionRepository.insertSubmissionToDB).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: 'Candidate not found',
        details: `Candidate with ID ${submissionData.candidate_id} does not exist`,
      });
    });

    test('should return 404 when questions do not exist', async () => {
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

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.questionsExist.mockResolvedValue({
        exists: false,
        missingIds: ['507f1f77bcf86cd799439012'],
      });

      // Execute
      const response = await request(app).post('/api/submissions').send(submissionData).expect(404);

      // Verify
      expect(submissionValidator.validateSubmissionInput).toHaveBeenCalledWith(submissionData);
      expect(submissionRepository.candidateExists).toHaveBeenCalledWith(
        submissionData.candidate_id
      );
      expect(submissionRepository.questionsExist).toHaveBeenCalledWith([
        submissionData.answers[0].question_id,
      ]);
      expect(submissionRepository.insertSubmissionToDB).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: 'Questions not found',
        details: 'The following question IDs do not exist: 507f1f77bcf86cd799439012',
      });
    });

    test('should return 500 when an error occurs', async () => {
      // Mock data
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        answers: [],
      };

      // Setup mocks
      submissionValidator.validateSubmissionInput.mockReturnValue({
        isValid: true,
        errors: [],
      });
      submissionRepository.candidateExists.mockRejectedValue(new Error('Database error'));

      // Execute
      const response = await request(app).post('/api/submissions').send(submissionData).expect(500);

      // Verify
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to create submission',
      });
    });
  });

  describe('GET /api/submissions/:id', () => {
    test('should return a submission when found', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439011';
      const submission = {
        _id: submissionId,
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [],
      };

      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(submission);

      // Execute
      const response = await request(app).get(`/api/submissions/${submissionId}`).expect(200);

      // Verify
      expect(submissionRepository.getSubmissionById).toHaveBeenCalledWith(submissionId);
      expect(response.body).toEqual({
        success: true,
        data: submission,
      });
    });

    test('should return 404 when submission is not found', async () => {
      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(null);

      // Execute
      const response = await request(app)
        .get('/api/submissions/507f1f77bcf86cd799439011')
        .expect(404);

      // Verify
      expect(response.body).toEqual({
        success: false,
        error: 'Submission not found',
      });
    });

    test('should return 500 when an error occurs', async () => {
      // Setup mocks
      submissionRepository.getSubmissionById.mockRejectedValue(new Error('Database error'));

      // Execute
      const response = await request(app)
        .get('/api/submissions/507f1f77bcf86cd799439011')
        .expect(500);

      // Verify
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to retrieve submission',
      });
    });
  });

  describe('GET /api/submissions/candidate/:candidateId', () => {
    test('should return submissions for a candidate', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const submissions = [
        {
          _id: '507f1f77bcf86cd799439012',
          candidate_id: candidateId,
          answers: [],
        },
      ];

      // Setup mocks
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.getSubmissionsByCandidateId.mockResolvedValue(submissions);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/candidate/${candidateId}`)
        .expect(200);

      // Verify
      expect(submissionRepository.candidateExists).toHaveBeenCalledWith(candidateId);
      expect(submissionRepository.getSubmissionsByCandidateId).toHaveBeenCalledWith(candidateId);
      expect(response.body).toEqual({
        success: true,
        data: submissions,
      });
    });

    test('should return 404 when candidate is not found', async () => {
      // Setup mocks
      submissionRepository.candidateExists.mockResolvedValue(false);

      // Execute
      const response = await request(app)
        .get('/api/submissions/candidate/507f1f77bcf86cd799439011')
        .expect(404);

      // Verify
      expect(submissionRepository.getSubmissionsByCandidateId).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: 'Candidate not found',
      });
    });

    test('should return 500 when an error occurs', async () => {
      // Setup mocks
      submissionRepository.candidateExists.mockRejectedValue(new Error('Database error'));

      // Execute
      const response = await request(app)
        .get('/api/submissions/candidate/507f1f77bcf86cd799439011')
        .expect(500);

      // Verify
      expect(response.body).toEqual({
        success: false,
        error: 'Failed to retrieve submissions',
      });
    });
  });
});
