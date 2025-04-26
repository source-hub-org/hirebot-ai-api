/**
 * Submission Routes Enrichment Tests
 */

const request = require('supertest');
const { app } = require('../../src/index');
const submissionRepository = require('../../src/repository/submissionRepository');
const { ObjectId } = require('mongodb');

// Mock dependencies
jest.mock('../../src/repository/submissionRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Routes with Enrichment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/submissions/:id with enrichment', () => {
    test('should return an enriched submission when found', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439011';
      const enrichedSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
            question: {
              _id: new ObjectId('507f1f77bcf86cd799439013'),
              text: 'Question 1',
              type: 'multiple_choice',
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
            },
          },
        ],
        candidate: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          full_name: 'John Doe',
          email: 'john@example.com',
          interview_level: 'junior',
        },
      };

      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(enrichedSubmission);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/${submissionId}?enrich=true`)
        .expect(200);

      // Verify
      expect(submissionRepository.getSubmissionById).toHaveBeenCalledWith(submissionId, true);
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          candidate_id: enrichedSubmission.candidate_id,
          candidate: expect.objectContaining({
            full_name: 'John Doe',
          }),
          answers: expect.arrayContaining([
            expect.objectContaining({
              question: expect.objectContaining({
                text: 'Question 1',
              }),
            }),
          ]),
        }),
      });
    });

    test('should handle missing candidate data', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439011';
      const enrichedSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [],
        candidate: null, // Missing candidate
      };

      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(enrichedSubmission);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/${submissionId}?enrich=true`)
        .expect(200);

      // Verify
      expect(submissionRepository.getSubmissionById).toHaveBeenCalledWith(submissionId, true);
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          candidate_id: enrichedSubmission.candidate_id,
          candidate: null,
        }),
      });
    });

    test('should handle missing question data', async () => {
      // Mock data
      const submissionId = '507f1f77bcf86cd799439011';
      const enrichedSubmission = {
        _id: new ObjectId(submissionId),
        candidate_id: '507f1f77bcf86cd799439012',
        answers: [
          {
            question_id: '507f1f77bcf86cd799439013',
            answer: 2,
            question: null, // Missing question
          },
        ],
        candidate: {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          full_name: 'John Doe',
        },
      };

      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(enrichedSubmission);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/${submissionId}?enrich=true`)
        .expect(200);

      // Verify
      expect(submissionRepository.getSubmissionById).toHaveBeenCalledWith(submissionId, true);
      expect(response.body).toEqual({
        success: true,
        data: expect.objectContaining({
          answers: expect.arrayContaining([
            expect.objectContaining({
              question_id: '507f1f77bcf86cd799439013',
              question: null,
            }),
          ]),
        }),
      });
    });

    test('should return 404 when submission is not found', async () => {
      // Setup mocks
      submissionRepository.getSubmissionById.mockResolvedValue(null);

      // Execute
      const response = await request(app)
        .get('/api/submissions/507f1f77bcf86cd799439011?enrich=true')
        .expect(404);

      // Verify
      expect(response.body).toEqual({
        success: false,
        error: 'Submission not found',
      });
    });
  });

  describe('GET /api/submissions/candidate/:candidateId with enrichment', () => {
    test('should return enriched submissions for a candidate', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const enrichedSubmissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          candidate_id: candidateId,
          answers: [
            {
              question_id: '507f1f77bcf86cd799439013',
              answer: 2,
              question: {
                _id: new ObjectId('507f1f77bcf86cd799439013'),
                text: 'Question 1',
              },
            },
          ],
          candidate: {
            _id: new ObjectId(candidateId),
            full_name: 'John Doe',
          },
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439014'),
          candidate_id: candidateId,
          answers: [
            {
              question_id: '507f1f77bcf86cd799439015',
              answer: 1,
              question: {
                _id: new ObjectId('507f1f77bcf86cd799439015'),
                text: 'Question 2',
              },
            },
          ],
          candidate: {
            _id: new ObjectId(candidateId),
            full_name: 'John Doe',
          },
        },
      ];

      // Setup mocks
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.getSubmissionsByCandidateId.mockResolvedValue(enrichedSubmissions);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/candidate/${candidateId}?enrich=true`)
        .expect(200);

      // Verify
      expect(submissionRepository.candidateExists).toHaveBeenCalledWith(candidateId);
      expect(submissionRepository.getSubmissionsByCandidateId).toHaveBeenCalledWith(
        candidateId,
        true
      );
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            candidate: expect.objectContaining({
              full_name: 'John Doe',
            }),
            answers: expect.arrayContaining([
              expect.objectContaining({
                question: expect.objectContaining({
                  text: expect.any(String),
                }),
              }),
            ]),
          }),
        ]),
      });
    });

    test('should handle empty answers array', async () => {
      // Mock data
      const candidateId = '507f1f77bcf86cd799439011';
      const enrichedSubmissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439012'),
          candidate_id: candidateId,
          answers: [], // Empty answers array
          candidate: {
            _id: new ObjectId(candidateId),
            full_name: 'John Doe',
          },
        },
      ];

      // Setup mocks
      submissionRepository.candidateExists.mockResolvedValue(true);
      submissionRepository.getSubmissionsByCandidateId.mockResolvedValue(enrichedSubmissions);

      // Execute
      const response = await request(app)
        .get(`/api/submissions/candidate/${candidateId}?enrich=true`)
        .expect(200);

      // Verify
      expect(submissionRepository.getSubmissionsByCandidateId).toHaveBeenCalledWith(
        candidateId,
        true
      );
      expect(response.body).toEqual({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            answers: [],
          }),
        ]),
      });
    });

    test('should return 404 when candidate is not found', async () => {
      // Setup mocks
      submissionRepository.candidateExists.mockResolvedValue(false);

      // Execute
      const response = await request(app)
        .get('/api/submissions/candidate/507f1f77bcf86cd799439011?enrich=true')
        .expect(404);

      // Verify
      expect(submissionRepository.getSubmissionsByCandidateId).not.toHaveBeenCalled();
      expect(response.body).toEqual({
        success: false,
        error: 'Candidate not found',
      });
    });
  });
});
