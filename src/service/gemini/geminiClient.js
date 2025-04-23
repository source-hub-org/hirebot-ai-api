/**
 * @fileoverview Client for interacting with Google's Gemini AI API.
 * This module provides a configured client for making requests to the Gemini API.
 * All configuration is loaded from environment variables.
 */

const https = require('https');
const dotenv = require('dotenv');

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
    };

    const req = https.request(url, options, res => {
      let responseData = '';

      res.on('data', chunk => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(
              new Error(
                `API request failed with status ${res.statusCode}: ${JSON.stringify(parsedData)}`
              )
            );
          }
        } catch (error) {
          reject(new Error(`Failed to parse API response: ${error.message}`));
        }
      });
    });

    req.on('error', error => {
      reject(new Error(`Request to Gemini API failed: ${error.message}`));
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
 * @returns {Promise<string>} The generated text response
 * @throws {Error} If the API request fails
 */
async function generateContent(prompt, options = {}) {
  // Validate API key first
  validateApiKey();

  const model = options.model || DEFAULT_MODEL;
  const temperature = options.temperature || DEFAULT_TEMPERATURE;
  const maxOutputTokens = options.maxOutputTokens || DEFAULT_MAX_TOKENS;

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

  try {
    const response = await makeRequest(endpoint, requestData);

    // Extract the generated text from the response
    if (
      response.candidates &&
      response.candidates[0] &&
      response.candidates[0].content &&
      response.candidates[0].content.parts &&
      response.candidates[0].content.parts[0]
    ) {
      return response.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response structure from Gemini API');
    }
  } catch (error) {
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

module.exports = {
  generateContent,
  validateApiKey,
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
};
