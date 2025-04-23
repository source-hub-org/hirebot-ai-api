/**
 * @fileoverview Client for interacting with Google's Gemini AI API.
 * This module provides a configured client for making requests to the Gemini API.
 * All configuration is loaded from environment variables.
 */

const https = require('https');
const dotenv = require('dotenv');
const logger = require('@utils/logger');

// Load environment variables
dotenv.config();

// Configuration from environment variables
const API_KEY = process.env.GEMINI_API_KEY;
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const BASE_URL =
  process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const DEFAULT_MAX_TOKENS = parseInt(process.env.GEMINI_MAX_OUTPUT_TOKENS || '4096', 10);
const DEFAULT_TEMPERATURE = parseFloat(process.env.GEMINI_TEMPERATURE || '0.7');

/**
 * Validates that the API key is available
 * @throws {Error} If API key is not configured
 */
function validateApiKey() {
  if (!API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }
  
  // Log the first few characters of the API key for debugging
  logger.info(`Using Gemini API key: ${API_KEY.substring(0, 5)}...${API_KEY.substring(API_KEY.length - 5)}`);
  
  // Check if the API key looks valid (basic format check)
  if (API_KEY.length < 20) {
    logger.warn('Gemini API key looks suspiciously short. Please verify it is correct.');
  }
}

/**
 * Makes a POST request to the Gemini API
 *
 * @param {string} endpoint - The API endpoint to call
 * @param {Object} data - The request payload
 * @returns {Promise<Object>} The parsed JSON response
 * @throws {Error} If the request fails
 */
async function makeRequest(endpoint, data) {
  validateApiKey();

  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${endpoint}?key=${API_KEY}`;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 seconds timeout
    };

    logger.info(`Making request to: ${url}`);
    logger.info(`Request data: ${JSON.stringify(data).substring(0, 200)}...`);
    
    const req = https.request(url, options, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        logger.info(`Response status code: ${res.statusCode}`);
        logger.info(`Response headers: ${JSON.stringify(res.headers)}`);
        
        try {
          // Check if we have a valid response before parsing
          if (!responseData || responseData.trim() === '') {
            logger.error('Empty response received from Gemini API');
            reject(new Error('Empty response received from Gemini API'));
            return;
          }

          logger.info(`Raw response (first 200 chars): ${responseData.substring(0, 200)}...`);
          
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            logger.error(`API request failed with status ${res.statusCode}: ${JSON.stringify(parsedData)}`);
            reject(
              new Error(
                `API request failed with status ${res.statusCode}: ${JSON.stringify(parsedData)}`
              )
            );
          }
        } catch (error) {
          logger.error(`Failed to parse API response: ${error.message}`);
          logger.error(`Raw response: ${responseData.substring(0, 500)}...`);
          reject(
            new Error(
              `Failed to parse API response: ${error.message}. Raw response: ${responseData.substring(0, 200)}...`
            )
          );
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`Request to Gemini API failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request to Gemini API timed out after 60 seconds'));
    });

    req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * Sends a prompt to the Gemini API and returns the response
 *
 * @param {string} prompt - The text prompt to send to Gemini
 * @param {Object} options - Additional options for the request
 * @param {string} [options.model] - The model to use (defaults to env var GEMINI_MODEL)
 * @param {number} [options.temperature] - Controls randomness (defaults to env var GEMINI_TEMPERATURE)
 * @param {number} [options.maxOutputTokens] - Maximum tokens in response (defaults to env var GEMINI_MAX_OUTPUT_TOKENS)
 * @param {number} [options.maxRetries] - Maximum number of retries on failure (default: 3)
 * @param {number} [options.retryDelay] - Delay between retries in milliseconds (default: 1000)
 * @returns {Promise<string>} The generated text response
 * @throws {Error} If the API request fails after all retries
 */
async function generateContent(prompt, options = {}) {
  // Validate API key first
  validateApiKey();

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature || DEFAULT_TEMPERATURE;
  const maxOutputTokens = options.maxOutputTokens || DEFAULT_MAX_TOKENS;
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;

  // Ensure we don't have double /models/ in the endpoint
  const endpoint = model.includes(':generateContent')
    ? `/models/${model}`
    : `/models/${model}:generateContent`;

  const requestData = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature,
      maxOutputTokens,
    },
  };

  // Helper function for delay
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  let lastError = null;

  // Implement retry logic
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Attempt ${attempt}/${maxRetries} to generate content with Gemini API`);

      const response = await makeRequest(endpoint, requestData);

      // Extract the generated text from the response
      if (
        response.candidates &&
        response.candidates[0] &&
        response.candidates[0].content &&
        response.candidates[0].content.parts &&
        response.candidates[0].content.parts[0]
      ) {
        const generatedText = response.candidates[0].content.parts[0].text;

        // Check if we have a valid response
        if (!generatedText || generatedText.trim() === '') {
          throw new Error('Empty text generated by Gemini API');
        }

        return generatedText;
      } else {
        // Provide more detailed error information about the response structure
        throw new Error(
          `Unexpected response structure from Gemini API: ${JSON.stringify(response).substring(0, 200)}...`
        );
      }
    } catch (error) {
      lastError = error;
      logger.error(`Attempt ${attempt} failed: ${error.message}`);

      // If we have more attempts left, wait before retrying
      if (attempt < maxRetries) {
        // Exponential backoff: increase delay with each retry
        const backoffDelay = retryDelay * Math.pow(2, attempt - 1);
        logger.info(`Retrying in ${backoffDelay}ms...`);
        await delay(backoffDelay);
      }
    }
  }

  // If we've exhausted all retries, throw the last error
  throw new Error(
    `Failed to generate content after ${maxRetries} attempts: ${lastError.message} (Model: ${model}, MaxTokens: ${maxOutputTokens})`
  );
}

module.exports = {
  generateContent,
  validateApiKey,
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
};
