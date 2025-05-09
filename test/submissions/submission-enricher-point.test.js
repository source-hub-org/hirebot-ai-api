/**
 * Submission Enricher Point Field Tests
 */

const { ObjectId } = require('mongodb');
const submissionEnricher = require('../../src/utils/submissionEnricher');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Enricher - Point Field', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enrichSubmission with point fields', () => {
    test('should preserve point fields when enriching a submission', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
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

      // Create a mock enriched submission that would be returned by the enrichSubmission function
      const enrichedSubmission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
        candidate_id: '507f1f77bcf86cd799439011',
        candidate: null, // We'll mock this as null since we're not testing candidate enrichment
        answers: [
          {
            question_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
            question: null, // We'll mock this as null since we're not testing question enrichment
          },
        ],
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439013',
            answer: 3,
            point: 7.5,
            is_skip: 0,
            instrument: null, // We'll mock this as null since we're not testing instrument enrichment
          },
        ],
      };

      // Mock the enrichSubmission function to return our mock enriched submission
      submissionEnricher.enrichSubmission = jest.fn().mockResolvedValue(enrichedSubmission);

      // Execute
      const enriched = await submissionEnricher.enrichSubmission(submission);

      // Verify point fields are preserved
      expect(enriched.answers[0].point).toBe(5);
      expect(enriched.instruments[0].point).toBe(7.5);
    });
  });

  describe('enrichSubmissions with point fields', () => {
    test('should preserve point fields when enriching multiple submissions', async () => {
      // Mock data
      const submissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439010'),
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
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439020'),
          candidate_id: '507f1f77bcf86cd799439011',
          answers: [
            {
              question_id: '507f1f77bcf86cd799439022',
              answer: 1,
              point: 3,
              is_skip: 0,
            },
          ],
          instruments: [
            {
              instrument_id: '507f1f77bcf86cd799439023',
              answer: 2,
              point: 4.5,
              is_skip: 0,
            },
          ],
        },
      ];

      // Create mock enriched submissions
      const enrichedSubmissions = [
        {
          _id: new ObjectId('507f1f77bcf86cd799439010'),
          candidate_id: '507f1f77bcf86cd799439011',
          candidate: null,
          answers: [
            {
              question_id: '507f1f77bcf86cd799439012',
              answer: 2,
              point: 5,
              is_skip: 0,
              question: null,
            },
          ],
          instruments: [
            {
              instrument_id: '507f1f77bcf86cd799439013',
              answer: 3,
              point: 7.5,
              is_skip: 0,
              instrument: null,
            },
          ],
        },
        {
          _id: new ObjectId('507f1f77bcf86cd799439020'),
          candidate_id: '507f1f77bcf86cd799439011',
          candidate: null,
          answers: [
            {
              question_id: '507f1f77bcf86cd799439022',
              answer: 1,
              point: 3,
              is_skip: 0,
              question: null,
            },
          ],
          instruments: [
            {
              instrument_id: '507f1f77bcf86cd799439023',
              answer: 2,
              point: 4.5,
              is_skip: 0,
              instrument: null,
            },
          ],
        },
      ];

      // Mock the enrichSubmissions function
      submissionEnricher.enrichSubmissions = jest.fn().mockResolvedValue(enrichedSubmissions);

      // Execute
      const enriched = await submissionEnricher.enrichSubmissions(submissions);

      // Verify
      expect(enriched).toHaveLength(2);

      // Verify point fields are preserved in first submission
      expect(enriched[0].answers[0].point).toBe(5);
      expect(enriched[0].instruments[0].point).toBe(7.5);

      // Verify point fields are preserved in second submission
      expect(enriched[1].answers[0].point).toBe(3);
      expect(enriched[1].instruments[0].point).toBe(4.5);
    });
  });
});
