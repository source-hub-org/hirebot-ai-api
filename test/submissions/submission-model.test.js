/**
 * Submission Model Tests
 */

const submissionModel = require('../../src/models/submissionModel');

describe('Submission Model', () => {
  test('should have the correct collection name', () => {
    expect(submissionModel.collectionName).toBe('submissions');
  });

  test('should have the required fields defined', () => {
    expect(submissionModel.requiredFields).toContain('candidate_id');
  });

  test('should have the required answer fields defined', () => {
    expect(submissionModel.requiredAnswerFields).toContain('question_id');
  });

  test('should have default values defined', () => {
    expect(submissionModel.defaultValues).toHaveProperty('answers');
    expect(submissionModel.defaultValues).toHaveProperty('essay');
    expect(submissionModel.defaultValues).toHaveProperty('review');
  });

  test('should have the correct default value for review.status', () => {
    expect(submissionModel.defaultValues.review.status).toBe('submitted');
  });

  test('should have answer value range defined', () => {
    expect(submissionModel.answerValueRange).toHaveProperty('min', 0);
    expect(submissionModel.answerValueRange).toHaveProperty('max', 3);
  });
});
