/**
 * Automated tests for geminiClient.js
 * @module test/geminiClientTest
 */

const https = require('https');
// Only import what we're using directly in the tests
const { generateContent } = require('../../src/service/gemini/geminiClient');

// Mock the https module
jest.mock('https');

describe('Gemini Client Tests', () => {
  // Save original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    process.env = { ...originalEnv };
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'test-model';
    process.env.GEMINI_API_BASE_URL = 'https://test-api-url.com';
    process.env.GEMINI_MAX_OUTPUT_TOKENS = '2000';
    process.env.GEMINI_TEMPERATURE = '0.5';

    // Reset all mocks
    jest.resetAllMocks();
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  describe('Configuration', () => {
    test('should use environment variables for configuration', () => {
      // Set environment variables
      process.env.GEMINI_MODEL = 'test-model';
      process.env.GEMINI_TEMPERATURE = '0.5';
      process.env.GEMINI_MAX_OUTPUT_TOKENS = '2000';

      // Re-import the module to test environment variable loading
      jest.resetModules();
      const geminiClient = require('../../src/service/gemini/geminiClient');

      // Check that the module uses the environment variables
      expect(geminiClient.DEFAULT_MODEL).toBe('test-model');
      expect(geminiClient.DEFAULT_TEMPERATURE).toBe(0.5);
      expect(geminiClient.DEFAULT_MAX_TOKENS).toBe(2000);
    });

    test('should use default values when environment variables are not set', () => {
      // Remove environment variables
      delete process.env.GEMINI_MODEL;
      delete process.env.GEMINI_TEMPERATURE;
      delete process.env.GEMINI_MAX_OUTPUT_TOKENS;

      // Re-import the module to test default values
      jest.resetModules();
      const geminiClient = require('../../src/service/gemini/geminiClient');

      // Check that the module uses the default values
      expect(geminiClient.DEFAULT_MODEL).toBe('gemini-2.0-flash');
      expect(geminiClient.DEFAULT_TEMPERATURE).toBe(0.7);
      expect(geminiClient.DEFAULT_MAX_TOKENS).toBe(8192);
    });
  });

  describe('generateContent', () => {
    test('should handle API key validation', () => {
      // Save the original API_KEY value
      const originalApiKey = process.env.GEMINI_API_KEY;

      try {
        // Set API_KEY to undefined to trigger the validation error
        process.env.GEMINI_API_KEY = '';

        // Re-import the module to pick up the environment change
        jest.resetModules();
        const { validateApiKey } = require('../../src/service/gemini/geminiClient');

        // Expect the function to throw when called
        expect(() => {
          validateApiKey();
        }).toThrow();
      } finally {
        // Restore the original API_KEY
        process.env.GEMINI_API_KEY = originalApiKey;
      }
    });

    test('should make a request with correct parameters', async () => {
      // Mock the https.request implementation
      const mockRequest = {
        on: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') {
            callback(
              JSON.stringify({
                candidates: [
                  {
                    content: {
                      parts: [
                        {
                          text: 'Generated content',
                        },
                      ],
                    },
                  },
                ],
              })
            );
          } else if (event === 'end') {
            callback();
          }
          return mockResponse;
        }),
        statusCode: 200,
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      // Call the function
      const prompt = 'Test prompt';
      const options = {
        temperature: 0.8,
        maxOutputTokens: 3000,
        model: 'custom-model',
      };

      await generateContent(prompt, options);

      // Check that https.request was called with correct URL and options
      expect(https.request).toHaveBeenCalled();
      const [url, requestOptions] = https.request.mock.calls[0];

      // Just check for the model name and key parameter
      expect(url).toContain('custom-model');
      expect(url).toContain('key=');
      expect(requestOptions.method).toBe('POST');
      expect(requestOptions.headers['Content-Type']).toBe('application/json');

      // Check that request.write was called with correct data
      expect(mockRequest.write).toHaveBeenCalled();
      const requestData = JSON.parse(mockRequest.write.mock.calls[0][0]);

      expect(requestData.contents[0].parts[0].text).toBe(prompt);
      expect(requestData.generationConfig.temperature).toBe(0.8);
      expect(requestData.generationConfig.maxOutputTokens).toBe(3000);
    });

    test('should use default values when options are not provided', async () => {
      // Mock the https.request implementation
      const mockRequest = {
        on: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') {
            callback(
              JSON.stringify({
                candidates: [
                  {
                    content: {
                      parts: [
                        {
                          text: 'Generated content',
                        },
                      ],
                    },
                  },
                ],
              })
            );
          } else if (event === 'end') {
            callback();
          }
          return mockResponse;
        }),
        statusCode: 200,
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      // Call the function without options
      await generateContent('Test prompt');

      // Check that request.write was called with default values
      expect(mockRequest.write).toHaveBeenCalled();
      const requestData = JSON.parse(mockRequest.write.mock.calls[0][0]);

      // Check that the default values from environment variables are used
      expect(requestData.generationConfig).toBeDefined();
      expect(typeof requestData.generationConfig.temperature).toBe('number');
      expect(typeof requestData.generationConfig.maxOutputTokens).toBe('number');
    });

    test('should handle API error responses', async () => {
      // Mock the https.request implementation for error response
      const mockRequest = {
        on: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') {
            callback('{"error": {"message": "API error"}}');
          } else if (event === 'end') {
            callback();
          }
          return mockResponse;
        }),
        statusCode: 400,
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      // Call the function and expect it to throw
      await expect(generateContent('Test prompt')).rejects.toThrow(
        'Failed to generate content after 3 attempts: API request failed with status 400'
      );
    });

    test('should handle network errors', async () => {
      // Mock the https.request implementation for network error
      const mockRequest = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'error') {
            callback(new Error('Network error'));
          }
          return mockRequest;
        }),
        write: jest.fn(),
        end: jest.fn(),
      };

      https.request.mockReturnValue(mockRequest);

      // Call the function and expect it to throw
      await expect(generateContent('Test prompt')).rejects.toThrow(
        'Failed to generate content after 3 attempts: Request to Gemini API failed: Network error'
      );
    });

    test('should handle unexpected response structure', async () => {
      // Mock the https.request implementation
      const mockRequest = {
        on: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      };

      const mockResponse = {
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'data') {
            callback('{"result": "Invalid structure"}');
          } else if (event === 'end') {
            callback();
          }
          return mockResponse;
        }),
        statusCode: 200,
      };

      https.request.mockImplementation((url, options, callback) => {
        callback(mockResponse);
        return mockRequest;
      });

      // Call the function and expect it to throw
      await expect(generateContent('Test prompt')).rejects.toThrow(
        'Failed to generate content after 3 attempts: Unexpected response structure from Gemini API'
      );
    });
  });
});
