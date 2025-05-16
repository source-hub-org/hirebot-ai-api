# Question Generation

This document explains how HireBot AI generates technical interview questions using Google's Gemini AI.

## Overview

HireBot AI uses a sophisticated process to generate high-quality technical interview questions:

1. **Request Processing**: The system receives a request to generate questions for specific topics, positions, and languages.
2. **Job Queue**: The request is added to a Redis-based job queue for asynchronous processing.
3. **AI Prompt Construction**: A specialized prompt is constructed based on the requested parameters.
4. **Gemini AI Integration**: The prompt is sent to Google's Gemini AI model.
5. **Response Processing**: The AI's response is processed, validated, and stored in the database.

## Generation Process

### 1. Request Initiation

Questions can be generated through:

- API endpoint: `POST /api/questions/generate`
- CLI command: `npm run generate-questions`

### 2. Job Queue Management

The system uses Redis for job queue management:

- Jobs are added to the queue with a unique ID
- A worker process polls the queue for new jobs
- Jobs are processed in the background, allowing the API to respond immediately

### 3. Prompt Construction

The prompt builder creates a detailed prompt for the AI, including:

- Topic details and requirements
- Position-specific context
- Language preferences
- Question format specifications
- Examples of good questions
- Validation criteria

### 4. AI Integration

The system integrates with Google's Gemini AI:

- Uses the Gemini API client to send prompts
- Configures model parameters (temperature, max tokens, etc.)
- Handles API rate limiting and retries

### 5. Response Processing

The AI's response is processed through several steps:

- JSON extraction from the response
- Schema validation against the question format
- Content validation for quality and relevance
- Duplicate detection against existing questions
- Storage in MongoDB with appropriate metadata

## Question Format

Generated questions follow a standardized JSON format:

```json
{
  "question": "What is the difference between 'let', 'const', and 'var' in JavaScript?",
  "difficulty": "medium",
  "answer": "...",
  "explanation": "...",
  "code_snippet": "...",
  "topics": ["javascript", "variables"],
  "metadata": {
    "position_level": 2,
    "language": "en",
    "generated_at": "2023-05-15T10:30:00Z"
  }
}
```

## Validation Process

Questions undergo rigorous validation:

1. **Schema Validation**: Ensures the question follows the required format
2. **Content Validation**: Checks for quality, relevance, and appropriateness
3. **Duplicate Detection**: Prevents storing similar questions
4. **Technical Accuracy**: Verifies that code snippets and answers are correct

## Customization Options

The question generation process can be customized with:

- **Difficulty Levels**: Easy, medium, hard
- **Question Types**: Multiple-choice, open-ended, coding challenges
- **Topic Focus**: Specific areas within a technology
- **Position Requirements**: Junior, mid-level, senior positions
- **Language Preferences**: Programming languages and natural languages

## Performance Considerations

- **Rate Limiting**: The system respects Gemini API rate limits
- **Caching**: Frequently used prompts and responses are cached
- **Batch Processing**: Questions are generated in batches for efficiency
- **Fallback Mechanisms**: Alternative generation strategies if the primary method fails

## Troubleshooting

Common issues and solutions:

1. **Generation Timeout**: Increase the timeout settings or reduce batch size
2. **Low-Quality Questions**: Adjust the prompt or increase the model temperature
3. **API Rate Limiting**: Implement exponential backoff for retries
4. **Duplicate Questions**: Adjust the similarity threshold for duplicate detection
