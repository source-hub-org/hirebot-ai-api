/**
 * Submission Validator Logic Questions Format Tests
 */

const {
  formatSubmissionDefaults,
  sanitizeUpdateData,
} = require('../../src/utils/submissionValidator');

describe('Submission Validator - Logic Questions Format', () => {
  describe('formatSubmissionDefaults', () => {
    test('should apply default values to logic questions', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            // Missing other fields
          },
        ],
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.logic_questions[0]).toEqual({
        logic_question_id: '507f1f77bcf86cd799439015',
        answer: '',
        other: '',
        point: 0,
        is_skip: 0,
      });
    });

    test('should not modify existing logic question values', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            other: 'Some notes',
            point: 10,
            is_skip: 1,
          },
        ],
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.logic_questions[0]).toEqual(submissionData.logic_questions[0]);
    });

    test('should add empty logic_questions array if not present', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        logic_questions: undefined,
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted.logic_questions).toEqual([]);
    });

    test('should not add logic_questions if not in original data', () => {
      const submissionData = {
        candidate_id: '507f1f77bcf86cd799439011',
        // No logic_questions property
      };

      const formatted = formatSubmissionDefaults(submissionData);
      expect(formatted).not.toHaveProperty('logic_questions');
    });
  });

  describe('sanitizeUpdateData', () => {
    test('should include logic_questions in sanitized update data', () => {
      const updateData = {
        logic_questions: [
          {
            logic_question_id: '507f1f77bcf86cd799439015',
            answer: 'true,false,true',
            point: 10,
          },
        ],
        invalid_field: 'should be removed',
      };

      const sanitized = sanitizeUpdateData(updateData);
      expect(sanitized).toHaveProperty('logic_questions');
      expect(sanitized.logic_questions).toEqual(updateData.logic_questions);
      expect(sanitized).not.toHaveProperty('invalid_field');
    });

    test('should handle empty logic_questions array', () => {
      const updateData = {
        logic_questions: [],
      };

      const sanitized = sanitizeUpdateData(updateData);
      expect(sanitized).toHaveProperty('logic_questions');
      expect(sanitized.logic_questions).toEqual([]);
    });
  });
});
