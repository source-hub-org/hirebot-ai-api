/**
 * Submission Routes Point Field Tests
 */

const request = require('supertest');
const express = require('express');
const { ObjectId } = require('mongodb');
const submissionRepository = require('../../src/repository/submissionRepository');
const submissionValidator = require('../../src/utils/submissionValidator');

// Mock dependencies
jest.mock('../../src/repository/submissionRepository');
jest.mock('../../src/utils/submissionValidator');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/submissions', require('../../src/routes/submissions'));

describe('Submission Routes - Point Field', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/submissions', () => {
    test('should create a submission with point fields', async () => {
      // Mock data
      const submissionData = {
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
        ...submissionData,
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
      const response = await request(app).post('/api/submissions').send(submissionData).expect(201);

      // Verify
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.answers[0]).toHaveProperty('point', 5);
      expect(response.body.data.instruments[0]).toHaveProperty('point', 7.5);
    });

    test('should reject a submission with invalid point values', async () => {
      // Mock data
      const submissionData = {
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
      const response = await request(app).post('/api/submissions').send(submissionData).expect(400);

      // Verify
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain(
        'Invalid point value in answers[0]. Must be a number greater than or equal to 0'
      );
    });
  });

  describe('PUT /api/submissions/:id', () => {
    test('should update a submission with point fields', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      const updateData = {
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
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439011',
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

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById
        .mockResolvedValueOnce(existingSubmission)
        .mockResolvedValueOnce(updatedSubmission);
      submissionValidator.sanitizeUpdateData.mockReturnValue(updateData);
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

      // Mock baseRepository.updateOne
      const baseRepository = require('../../src/repository/baseRepository');
      baseRepository.updateOne = jest.fn().mockResolvedValue({ acknowledged: true });

      // Execute
      const response = await request(app).put(`/api/submissions/${submissionId}`).send(updateData);

      // Verify
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.answers[0].point).toBe(8);
      expect(response.body.data.instruments[0].point).toBe(6);
    });
  });

  describe('GET /api/submissions/:id', () => {
    test('should return a submission with point fields', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439014';
      const submission = {
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

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      submissionRepository.getSubmissionById.mockResolvedValue(submission);

      // Execute
      const response = await request(app).get(`/api/submissions/${submissionId}`);

      // Verify
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');

      // Check that the response contains the expected point values
      const returnedAnswerPoint = response.body.data.answers[0].point;
      const returnedInstrumentPoint = response.body.data.instruments[0].point;

      expect(returnedAnswerPoint).toBe(5);
      expect(returnedInstrumentPoint).toBe(7.5);
    });
  });
});
