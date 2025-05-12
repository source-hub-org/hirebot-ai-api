/**
 * Submission Validator Logic Questions Tests
 */

const { validateSubmissionInput } = require('../../src/utils/submissionValidator');

// Mock the ObjectId.isValid function
jest.mock('mongodb', () => ({
  ObjectId: {
    isValid: jest.fn().mockImplementation(id => /^[0-9a-fA-F]{24}$/.test(id)),
  },
}));

describe('Submission Validator - Logic Questions', () => {
  describe('validateSubmissionInput', () => {
    test('should validate a submission with valid logic questions', () => {
      const submissionData = {
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

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject a submission with missing required logic question fields', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            // Missing logic_question_id
            answer: 'true,false,true',
            point: 10,
            is_skip: 0,
          },
        ],
      };

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Missing required field: logic_question_id in logic_questions[0]'
      );
    });

    test('should reject a submission with invalid logic question ID format', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: 'invalid-id',
            answer: 'true,false,true',
            point: 10,
            is_skip: 0,
          },
        ],
      };

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid logic_question_id format in logic_questions[0]');
    });

    test('should reject a submission with invalid logic question point value', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: -5, // Negative value is invalid
            is_skip: 0,
          },
        ],
      };

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid point value in logic_questions[0]. Must be a number greater than or equal to 0'
      );
    });

    test('should reject a submission with invalid logic question is_skip value', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
            is_skip: 2, // Only 0 or 1 is valid
          },
        ],
      };

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Invalid is_skip value in logic_questions[0]. Must be 0 or 1'
      );
    });

    test('should reject a submission with non-array logic_questions field', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: 'not an array',
      };

      const result = validateSubmissionInput(submissionData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Field logic_questions must be an array');
    });
  });
});
