const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

// Load environment variables
// Use .env.testing for test environments, otherwise use .env
if (process.env.NODE_ENV === 'testing') {
  dotenv.config({ path: '.env.testing' });
} else {
  dotenv.config();
}

// Get port from environment variables or use default
const SWAGGER_URL = process.env.SWAGGER_URL || 'http://localhost:8000';
const PORT = process.env.PORT || '3000';

// Swagger definition
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HireBot AI API Documentation',
      version: '1.0.0',
      description:
        'API documentation for HireBot AI, a service responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates.',
      contact: {
        name: 'HireBot AI Team',
      },
    },
    servers: [
      {
        url: `${SWAGGER_URL}`,
        description: 'Nginx reverse proxy server',
      },
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    security: [
      {
        bearerAuth: [],
      },
      {
        oauth2: ['read', 'write', 'admin'],
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer token in the format "Bearer {token}"',
        },
        oauth2: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/api/oauth/token',
              scopes: {
                read: 'Read access to protected resources',
                write: 'Write access to protected resources',
                admin: 'Admin access to protected resources',
              },
            },
            authorizationCode: {
              authorizationUrl: '/api/oauth/authorize',
              tokenUrl: '/api/oauth/token',
              scopes: {
                read: 'Read access to protected resources',
                write: 'Write access to protected resources',
                admin: 'Admin access to protected resources',
              },
            },
          },
        },
      },
      schemas: {
        PaginationInfo: {
          type: 'object',
          description: 'Pagination metadata for list endpoints',
          properties: {
            total: {
              type: 'integer',
              example: 50,
              description: 'Total number of records available across all pages',
            },
            page: {
              type: 'integer',
              example: 1,
              description: 'Current page number (1-based indexing)',
            },
            page_size: {
              type: 'integer',
              example: 20,
              description: 'Number of items returned per page',
            },
            total_pages: {
              type: 'integer',
              example: 3,
              description: 'Total number of pages available with current page_size',
            },
          },
        },
        Position: {
          type: 'object',
          description: 'Represents a job position or seniority level for technical roles',
          required: ['slug', 'title', 'description', 'instruction', 'level'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the position',
              example: '60d21b4667d0d8992e610c85',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly unique identifier for the position',
              example: 'senior-developer',
            },
            title: {
              type: 'string',
              description: 'Human-readable position title',
              example: 'Senior Developer',
            },
            description: {
              type: 'string',
              description: 'Detailed description of the position requirements and responsibilities',
              example:
                'Has deep knowledge of system scalability, performance, security, and maintainability. Capable of designing and implementing complex systems.',
            },
            instruction: {
              type: 'string',
              description: 'Specific instructions for generating questions for this position level',
              example:
                'Focus on technical leadership, problem-solving in complex environments, and system design principles.',
            },
            level: {
              type: 'integer',
              description: 'Numeric representation of seniority level (1-6, where 6 is highest)',
              minimum: 1,
              maximum: 6,
              example: 5,
            },
            is_active: {
              type: 'boolean',
              description: 'Whether this position is currently active in the system',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the position was created',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the position was last updated',
              example: '2023-02-20T14:15:30.000Z',
            },
          },
        },
        PositionList: {
          type: 'object',
          description: 'Response containing a paginated list of positions',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of position objects',
              items: {
                $ref: '#/components/schemas/Position',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the position list',
            },
          },
        },
        Language: {
          type: 'object',
          description: 'Programming language information used for generating technical questions',
          required: [
            'name',
            'designed_by',
            'first_appeared',
            'paradigm',
            'usage',
            'popularity_rank',
            'type_system',
          ],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the language',
              example: '60d21b4667d0d8992e610c85',
            },
            name: {
              type: 'string',
              description: 'Official name of the programming language',
              example: 'JavaScript',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly lowercase identifier for the language',
              example: 'javascript',
            },
            designed_by: {
              type: 'string',
              description: 'Original creator or designer of the language',
              example: 'Brendan Eich',
            },
            first_appeared: {
              type: 'integer',
              description: 'Year when the language was first released or published',
              example: 1995,
              minimum: 1940,
            },
            paradigm: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Programming paradigms supported by the language',
              example: ['event-driven', 'functional', 'imperative', 'prototype-based'],
            },
            usage: {
              type: 'string',
              description: 'Common application domains and platforms where the language is used',
              example:
                'Front-end web development, back-end (Node.js), mobile apps, serverless functions',
            },
            popularity_rank: {
              type: 'integer',
              description:
                'Relative popularity ranking compared to other languages (lower is more popular)',
              example: 2,
              minimum: 1,
            },
            type_system: {
              type: 'string',
              description: "Description of the language's type system characteristics",
              example: 'dynamic, weak, gradually typed (with TypeScript)',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this language record was created in the system',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this language record was last updated',
              example: '2023-02-20T14:15:30.000Z',
            },
          },
        },
        LanguageList: {
          type: 'object',
          description: 'Response containing a paginated list of programming languages',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of language objects',
              items: {
                $ref: '#/components/schemas/Language',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the language list',
            },
          },
        },
        Topic: {
          type: 'object',
          description: 'Technical topic for which interview questions can be generated',
          required: ['title', 'difficulty', 'popularity', 'suitable_level', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the topic',
              example: '60d21b4667d0d8992e610c85',
            },
            title: {
              type: 'string',
              description: 'Name of the technical topic',
              example: 'JavaScript Closures',
            },
            difficulty: {
              type: 'integer',
              description: 'Topic difficulty level on a scale of 1-5 (1: easiest, 5: hardest)',
              minimum: 1,
              maximum: 5,
              example: 3,
            },
            popularity: {
              type: 'string',
              description: 'Relative popularity/importance of the topic in industry',
              example: 'high',
              enum: ['low', 'medium', 'high'],
            },
            suitable_level: {
              type: 'string',
              description: 'Most appropriate experience level for questions on this topic',
              example: 'junior',
              enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'],
            },
            description: {
              type: 'string',
              description: 'Comprehensive description of the topic and its relevance',
              example:
                'JavaScript closures are a fundamental concept that allows functions to retain access to variables from their lexical scope even after the parent function has closed. This topic is essential for understanding advanced JavaScript patterns and functional programming concepts.',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this topic was created in the system',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this topic was last updated',
              example: '2023-02-20T14:15:30.000Z',
            },
          },
        },
        TopicList: {
          type: 'object',
          description: 'Response containing a list of technical topics',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of topic objects',
              items: {
                $ref: '#/components/schemas/Topic',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the topic list',
            },
          },
        },
        Candidate: {
          type: 'object',
          description: 'Job candidate information for technical interviews',
          required: ['full_name', 'email', 'phone_number', 'interview_level'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the candidate',
              example: '60d21b4667d0d8992e610c85',
            },
            full_name: {
              type: 'string',
              description: 'Complete name of the candidate',
              example: 'John Doe',
              minLength: 2,
              maxLength: 100,
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Valid email address for contacting the candidate',
              example: 'john.doe@example.com',
            },
            phone_number: {
              type: 'string',
              description: 'Contact phone number with international format',
              example: '+1234567890',
              pattern: '^\\+[0-9]{1,15}$',
            },
            interview_level: {
              type: 'string',
              description: 'Target experience level for the interview',
              example: 'junior',
              enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'],
            },
            resume_url: {
              type: 'string',
              description: "URL to the candidate's uploaded resume (optional)",
              example: 'https://storage.example.com/resumes/john-doe-resume.pdf',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this candidate was created in the system',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this candidate was last updated',
              example: '2023-02-20T14:15:30.000Z',
            },
          },
        },
        CandidateList: {
          type: 'object',
          description: 'Response containing a paginated list of candidates',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of candidate objects',
              items: {
                $ref: '#/components/schemas/Candidate',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the candidate list',
            },
          },
        },
        Question: {
          type: 'object',
          description: 'Technical interview question with multiple-choice answers',
          required: ['question', 'options', 'correct_answer', 'explanation', 'topic', 'difficulty'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the question',
              example: '60d21b4667d0d8992e610c85',
            },
            question: {
              type: 'string',
              description: 'The full text of the interview question',
              example: 'What is the difference between let and var in JavaScript?',
              minLength: 10,
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Array of possible answer choices',
              example: [
                'let is block-scoped, var is function-scoped',
                'let cannot be redeclared, var can be redeclared',
                'let is hoisted, var is not hoisted',
                'There is no difference',
              ],
              minItems: 2,
              maxItems: 6,
            },
            correct_answer: {
              type: 'array',
              items: {
                type: 'number',
              },
              description: 'Zero-based indices of the correct answer(s) from the options array',
              example: [0, 1],
              minItems: 1,
            },
            explanation: {
              type: 'string',
              description: 'Detailed explanation of why the correct answer(s) are correct',
              example:
                'let is block-scoped while var is function-scoped, meaning let is only accessible within the block it was declared. Additionally, let cannot be redeclared in the same scope, while var can be redeclared without error. The third option is incorrect because both let and var are hoisted, but let variables cannot be accessed before declaration (temporal dead zone).',
              minLength: 20,
            },
            topic: {
              type: 'string',
              description: 'The technical topic this question belongs to',
              example: 'JavaScript',
            },
            difficulty: {
              type: 'integer',
              description: 'Difficulty level on a scale of 1-5 (1: easiest, 5: hardest)',
              minimum: 1,
              maximum: 5,
              example: 3,
            },
            language: {
              type: 'string',
              description: 'Programming language this question relates to (if applicable)',
              example: 'JavaScript',
            },
            position: {
              type: 'string',
              description: 'Target job position this question is suitable for',
              example: 'Frontend Developer',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this question was created in the system',
              example: '2023-01-15T08:30:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this question was last updated',
              example: '2023-02-20T14:15:30.000Z',
            },
          },
        },
        QuestionList: {
          type: 'object',
          description: 'Response containing a paginated list of interview questions',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of question objects',
              items: {
                $ref: '#/components/schemas/Question',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the question list',
            },
          },
        },
        Submission: {
          type: 'object',
          description: "Candidate's submission of answers to interview questions",
          required: ['candidate_id'],
          properties: {
            _id: {
              type: 'string',
              description: 'Unique MongoDB identifier for the submission',
              example: '60d21b4667d0d8992e610c85',
            },
            candidate_id: {
              type: 'string',
              description: 'Reference to the candidate who submitted the answers',
              example: '60d21b4667d0d8992e610c85',
            },
            answers: {
              type: 'array',
              description: 'Collection of answers to individual questions',
              items: {
                type: 'object',
                required: ['question_id'],
                properties: {
                  question_id: {
                    type: 'string',
                    description: 'Reference to the question being answered',
                    example: '60d21b4667d0d8992e610c85',
                  },
                  selected_options: {
                    type: 'array',
                    items: {
                      type: 'number',
                    },
                    description: 'Zero-based indices of the options selected by the candidate',
                    example: [1, 3],
                  },
                  skipped: {
                    type: 'boolean',
                    description: 'Indicates if the candidate skipped this question',
                    example: false,
                  },
                  time_spent: {
                    type: 'number',
                    description: 'Time spent on this question in seconds (optional)',
                    example: 45.2,
                    minimum: 0,
                  },
                },
              },
            },
            score: {
              type: 'number',
              description: 'Overall percentage score for the submission (0-100)',
              example: 85.5,
              minimum: 0,
              maximum: 100,
            },
            completed_at: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the submission was completed',
              example: '2023-03-15T10:30:00.000Z',
            },
            duration: {
              type: 'number',
              description: 'Total time taken to complete the submission in seconds',
              example: 1200,
              minimum: 0,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this submission was created in the system',
              example: '2023-03-15T10:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when this submission was last updated',
              example: '2023-03-15T10:30:00.000Z',
            },
          },
        },
        SubmissionList: {
          type: 'object',
          description: 'Response containing a paginated list of candidate submissions',
          properties: {
            status: {
              type: 'string',
              description: 'Response status indicator',
              example: 'success',
            },
            data: {
              type: 'array',
              description: 'Array of submission objects',
              items: {
                $ref: '#/components/schemas/Submission',
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
              description: 'Pagination metadata for the submission list',
            },
          },
        },
        // Common response schemas
        UnauthorizedError: {
          type: 'object',
          description: 'Error response when authentication is required but not provided or invalid',
          properties: {
            status: {
              type: 'string',
              description: 'Error status indicator',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'Unauthorized',
            },
            data: {
              type: 'object',
              description: 'Additional error details',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error code',
                  example: 'unauthorized',
                },
                error_description: {
                  type: 'string',
                  description: 'Detailed error explanation',
                  example: 'Access token is required',
                },
              },
            },
          },
        },
        ForbiddenError: {
          type: 'object',
          description:
            'Error response when the user is authenticated but lacks sufficient permissions',
          properties: {
            status: {
              type: 'string',
              description: 'Error status indicator',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
              example: 'Forbidden',
            },
            data: {
              type: 'object',
              description: 'Additional error details',
              properties: {
                error: {
                  type: 'string',
                  description: 'Error code',
                  example: 'insufficient_scope',
                },
                error_description: {
                  type: 'string',
                  description: 'Detailed error explanation',
                  example: "Scope 'admin' is required",
                },
              },
            },
          },
        },
        TokenResponse: {
          type: 'object',
          description: 'OAuth2/JWT authentication token response',
          properties: {
            access_token: {
              type: 'string',
              description: 'JWT token for API authentication',
              example:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
            },
            token_type: {
              type: 'string',
              description: 'Type of token issued',
              example: 'Bearer',
              enum: ['Bearer'],
            },
            expires_in: {
              type: 'integer',
              description: 'Token validity period in seconds',
              example: 3600,
              minimum: 1,
            },
            refresh_token: {
              type: 'string',
              description: 'Token used to obtain a new access token when the current one expires',
              example:
                'def502003b1308e0de5b7a731e642a3deb42921e4a364d48e2a8d5adbcff9b2b9c18526b7ca9b92cc3',
            },
            scope: {
              type: 'string',
              description: 'Space-delimited list of scopes granted to this token',
              example: 'read write admin',
            },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Operation completed successfully',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'An error occurred',
            },
            data: {
              type: 'object',
              example: {},
              description: 'Empty object for simple errors',
            },
          },
        },
        ValidationErrorResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Validation failed',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: 'Email is required',
                  },
                },
              },
              description: 'Array of validation errors',
            },
          },
        },
        NotFoundResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              example: 'Resource not found',
            },
            data: {
              type: 'object',
              example: {},
              description: 'Empty object for not found errors',
            },
          },
        },
        Pagination: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              description: 'Total number of items',
              example: 100,
            },
            page: {
              type: 'integer',
              description: 'Current page number',
              example: 1,
            },
            page_size: {
              type: 'integer',
              description: 'Number of items per page',
              example: 10,
            },
            total_pages: {
              type: 'integer',
              description: 'Total number of pages',
              example: 10,
            },
          },
        },
        Instrument: {
          type: 'object',
          required: ['questionId', 'questionText', 'type', 'tags'],
          properties: {
            _id: {
              type: 'string',
              description: 'Instrument ID',
              example: '60d21b4667d0d8992e610c85',
            },
            questionId: {
              type: 'string',
              description: 'Unique question identifier',
              example: 'INST-001',
            },
            questionText: {
              type: 'string',
              description: 'Question text',
              example: 'How comfortable are you working in a team environment?',
            },
            type: {
              type: 'string',
              description: 'Question type',
              enum: ['scale', 'multiple-choice', 'open-ended', 'boolean'],
              example: 'scale',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Answer options (required for scale and multiple-choice types)',
              example: ['Not comfortable', 'Somewhat comfortable', 'Very comfortable'],
            },
            tags: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tag IDs associated with this instrument',
              example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        InstrumentList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Instrument',
              },
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        InstrumentTag: {
          type: 'object',
          required: ['name', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Instrument Tag ID',
              example: '60d21b4667d0d8992e610c85',
            },
            name: {
              type: 'string',
              description: 'Tag name',
              example: 'Teamwork',
            },
            description: {
              type: 'string',
              description: 'Tag description',
              example: 'Questions related to teamwork and collaboration skills',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        InstrumentTagList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/InstrumentTag',
              },
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        LogicTag: {
          type: 'object',
          required: ['name', 'slug'],
          properties: {
            _id: {
              type: 'string',
              description: 'Logic Tag ID',
              example: '60d21b4667d0d8992e610c85',
            },
            name: {
              type: 'string',
              description: 'Tag name',
              example: 'Algorithms',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly identifier',
              example: 'algorithms',
            },
            description: {
              type: 'string',
              description: 'Tag description',
              example: 'Questions related to algorithmic problem-solving',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        LogicTagList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LogicTag',
              },
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        Choice: {
          type: 'object',
          required: ['text', 'is_correct'],
          properties: {
            text: {
              type: 'string',
              description: 'Choice text',
              example: 'O(n log n)',
            },
            is_correct: {
              type: 'boolean',
              description: 'Whether this choice is correct',
              example: true,
            },
          },
        },
        LogicQuestion: {
          type: 'object',
          required: ['question', 'level', 'tag_ids', 'type', 'answer_explanation'],
          properties: {
            _id: {
              type: 'string',
              description: 'Logic Question ID',
              example: '60d21b4667d0d8992e610c85',
            },
            question: {
              type: 'string',
              description: 'Question text',
              example: 'What is the time complexity of the merge sort algorithm?',
            },
            level: {
              type: 'integer',
              description: 'Difficulty level (1-6)',
              example: 3,
              minimum: 1,
              maximum: 6,
            },
            tag_ids: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Tag IDs associated with this question',
              example: ['60d21b4667d0d8992e610c85', '60d21b4667d0d8992e610c86'],
            },
            type: {
              type: 'string',
              description: 'Question type',
              enum: ['multiple_choice', 'open_question'],
              example: 'multiple_choice',
            },
            choices: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Choice',
              },
              description: 'Answer choices (required for multiple_choice type)',
            },
            answer_explanation: {
              type: 'string',
              description: 'Explanation of the correct answer',
              example:
                'Merge sort has a time complexity of O(n log n) because it divides the array in half at each step (log n) and then performs a linear-time merge operation (n).',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        LogicQuestionList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/LogicQuestion',
              },
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        Job: {
          type: 'object',
          required: ['type', 'payload'],
          properties: {
            _id: {
              type: 'string',
              description: 'Job ID',
              example: '60d21b4667d0d8992e610c85',
            },
            type: {
              type: 'string',
              description: 'Job type',
              example: 'question_generation',
            },
            payload: {
              type: 'object',
              description: 'Job payload data',
            },
            status: {
              type: 'string',
              description: 'Job status',
              enum: ['new', 'pending', 'processing', 'done', 'failed'],
              example: 'pending',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        JobList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Job',
              },
            },
            pagination: {
              $ref: '#/components/schemas/Pagination',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID',
              example: '60d21b4667d0d8992e610c85',
            },
            username: {
              type: 'string',
              description: 'Username',
              example: 'johndoe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john.doe@example.com',
            },
            candidate_id: {
              type: 'string',
              description: 'Candidate ID reference',
              example: '60d21b4667d0d8992e610c86',
            },
            candidate: {
              $ref: '#/components/schemas/Candidate',
              description: 'Populated candidate information',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Last update timestamp',
            },
          },
        },
        UserList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            message: {
              type: 'string',
              example: 'Users retrieved successfully',
            },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  _id: {
                    type: 'string',
                    description: 'User ID',
                    example: '60d21b4667d0d8992e610c85',
                  },
                  username: {
                    type: 'string',
                    description: 'Username',
                    example: 'johndoe',
                  },
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address',
                    example: 'john.doe@example.com',
                  },
                  candidate_id: {
                    type: 'string',
                    description: 'Candidate ID reference',
                    example: '60d21b4667d0d8992e610c86',
                  },
                  candidate: {
                    $ref: '#/components/schemas/Candidate',
                    description: 'Populated candidate information',
                  },
                  createdAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Creation timestamp',
                  },
                  updatedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last update timestamp',
                  },
                },
              },
            },
            pagination: {
              $ref: '#/components/schemas/PaginationInfo',
            },
          },
        },
      },
    },
  },
  // Path to the API docs
  apis: ['./src/routes/**/*.js'], // Path to the API docs
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Function to setup our docs
const swaggerDocs = app => {
  // Route for swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Route to get swagger.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at ${SWAGGER_URL}/api-docs`);
};

module.exports = { swaggerDocs };
