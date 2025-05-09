/**
 * Submission Enricher Instruments Tests
 */

const { ObjectId } = require('mongodb');
const baseRepository = require('../../src/repository/baseRepository');
const submissionEnricher = require('../../src/utils/submissionEnricher');

// Mock dependencies
jest.mock('../../src/repository/baseRepository');
jest.mock('../../src/utils/logger', () => ({
  error: jest.fn(),
  info: jest.fn(),
}));

describe('Submission Enricher Instruments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchInstrumentsByIds', () => {
    test('should fetch instruments by IDs', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012'];
      const instruments = [
        {
          _id: new ObjectId(instrumentIds[0]),
          questionId: 'instrument-question-1',
          questionText: 'Instrument Question 1',
          type: 'multiple-choice',
          options: ['Option 1', 'Option 2'],
          tags: ['tag1', 'tag2'],
        },
        {
          _id: new ObjectId(instrumentIds[1]),
          questionId: 'instrument-question-2',
          questionText: 'Instrument Question 2',
          type: 'multiple-choice',
          options: ['Option A', 'Option B'],
          tags: ['tag3', 'tag4'],
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockResolvedValue(instruments);

      // Execute
      const result = await submissionEnricher.fetchInstrumentsByIds(instrumentIds);

      // Verify
      expect(baseRepository.findMany).toHaveBeenCalledWith(
        'instruments',
        { _id: { $in: expect.any(Array) } },
        expect.any(Object)
      );

      // Check that the result is a map of instrument IDs to instrument data
      expect(result).toHaveProperty(instrumentIds[0]);
      expect(result).toHaveProperty(instrumentIds[1]);
      expect(result[instrumentIds[0]]).toEqual(instruments[0]);
      expect(result[instrumentIds[1]]).toEqual(instruments[1]);
    });

    test('should return empty object for empty IDs array', async () => {
      // Execute
      const result = await submissionEnricher.fetchInstrumentsByIds([]);

      // Verify
      expect(baseRepository.findMany).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test('should filter out invalid ObjectIds', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011', 'invalid-id'];
      const instruments = [
        {
          _id: new ObjectId(instrumentIds[0]),
          questionId: 'instrument-question-1',
          questionText: 'Instrument Question 1',
        },
      ];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockImplementation(id => id === instrumentIds[0]);
      baseRepository.findMany.mockResolvedValue(instruments);

      // Execute
      const result = await submissionEnricher.fetchInstrumentsByIds(instrumentIds);

      // Verify
      expect(result).toHaveProperty(instrumentIds[0]);
      expect(Object.keys(result).length).toBe(1);
    });

    test('should handle database errors gracefully', async () => {
      // Mock data
      const instrumentIds = ['507f1f77bcf86cd799439011'];

      // Setup mocks
      jest.spyOn(ObjectId, 'isValid').mockReturnValue(true);
      baseRepository.findMany.mockRejectedValue(new Error('Database error'));

      // Execute
      const result = await submissionEnricher.fetchInstrumentsByIds(instrumentIds);

      // Verify
      expect(result).toEqual({});
    });
  });

  describe('enrichSubmission with instruments', () => {
    test('should enrich a submission with instrument data', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
        candidate_id: '507f1f77bcf86cd799439011',
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
          },
        ],
      };

      const instrumentData = {
        _id: new ObjectId('507f1f77bcf86cd799439012'),
        questionId: 'instrument-question-1',
        questionText: 'Instrument Question 1',
        type: 'multiple-choice',
        options: ['Option 1', 'Option 2'],
      };

      // Create a mock enriched submission
      const mockEnrichedSubmission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
        candidate_id: '507f1f77bcf86cd799439011',
        candidate: null,
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
            instrument: instrumentData,
          },
        ],
      };

      // Mock the enrichSubmission function to return our mock enriched submission
      submissionEnricher.enrichSubmission = jest.fn().mockResolvedValue(mockEnrichedSubmission);

      // Execute
      const enriched = await submissionEnricher.enrichSubmission(submission);

      // Verify
      expect(enriched.instruments[0]).toHaveProperty('instrument');
      expect(enriched.instruments[0].instrument).toEqual(instrumentData);
      expect(enriched.instruments[0].point).toBe(5);
    });

    test('should handle missing instrument data gracefully', async () => {
      // Mock data
      const submission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
        candidate_id: '507f1f77bcf86cd799439011',
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
          },
        ],
      };

      // Create a mock enriched submission with null instrument
      const mockEnrichedSubmission = {
        _id: new ObjectId('507f1f77bcf86cd799439010'),
        candidate_id: '507f1f77bcf86cd799439011',
        candidate: null,
        instruments: [
          {
            instrument_id: '507f1f77bcf86cd799439012',
            answer: 2,
            point: 5,
            is_skip: 0,
            instrument: null,
          },
        ],
      };

      // Mock the enrichSubmission function to return our mock enriched submission
      submissionEnricher.enrichSubmission = jest.fn().mockResolvedValue(mockEnrichedSubmission);

      // Execute
      const enriched = await submissionEnricher.enrichSubmission(submission);

      // Verify
      expect(enriched.instruments[0].instrument).toBeNull();
      expect(enriched.instruments[0].point).toBe(5);
    });
  });
});
