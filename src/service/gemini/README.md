# Gemini AI Integration for Quiz Question Generation

This module provides integration with Google's Gemini AI for generating technical interview quiz questions.

## Configuration

All configuration is loaded from environment variables:

```
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
GEMINI_MAX_OUTPUT_TOKENS=4096
GEMINI_TEMPERATURE=0.7
GEMINI_TMP_DIR=/tmp
```

## Usage Example

```javascript
const path = require('path');
const { generateQuizQuestions } = require('./quizQuestionCreator');

async function generateQuestions() {
  try {
    // Path to a file containing existing questions (one per line)
    const existingQuestionsPath = path.join(process.cwd(), 'data/existing-questions.txt');

    // Generate quiz questions
    const result = await generateQuizQuestions(existingQuestionsPath, {
      // Optional: Override default settings from environment variables
      temperature: 0.8,
      maxOutputTokens: 4096,
      model: 'gemini-2.0-flash',
    });

    console.log(`Generated questions saved to: ${result.filePath}`);
    console.log(`Number of questions generated: ${result.questions.length}`);

    return result;
  } catch (error) {
    console.error('Failed to generate quiz questions:', error.message);
    throw error;
  }
}

// Call the function
generateQuestions()
  .then(result => {
    console.log('Questions generated successfully');
  })
  .catch(error => {
    console.error('Error generating questions:', error);
  });
```

## File Structure

- `geminiClient.js`: Handles API configuration and request sending to Gemini AI
- `quizQuestionCreator.js`: Constructs prompts, interacts with Gemini AI, and saves results
- `../../config/question-format.json`: Defines the required output structure for questions

## Output Format

The generated questions follow this JSON format:

```json
[
  {
    "question": "What is the time complexity of a binary search algorithm?",
    "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
    "correctAnswer": 2,
    "explanation": "Binary search has a time complexity of O(log n) because it divides the search interval in half with each comparison.",
    "difficulty": "medium",
    "category": "Algorithms"
  }
]
```
