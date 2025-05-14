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
    components: {
      schemas: {
        PaginationInfo: {
          type: 'object',
          properties: {
            total: {
              type: 'integer',
              example: 50,
              description: 'Total number of records',
            },
            page: {
              type: 'integer',
              example: 1,
              description: 'Current page number',
            },
            page_size: {
              type: 'integer',
              example: 20,
              description: 'Number of items per page',
            },
            total_pages: {
              type: 'integer',
              example: 3,
              description: 'Total number of pages',
            },
          },
        },
        Position: {
          type: 'object',
          required: ['slug', 'title', 'description', 'instruction', 'level'],
          properties: {
            _id: {
              type: 'string',
              description: 'Position ID',
              example: '60d21b4667d0d8992e610c85',
            },
            slug: {
              type: 'string',
              description: 'Unique identifier for the position',
              example: 'senior',
            },
            title: {
              type: 'string',
              description: 'Position title',
              example: 'Senior Developer',
            },
            description: {
              type: 'string',
              description: 'Position description',
              example:
                'Has deep knowledge of system scalability, performance, security, and maintainability.',
            },
            instruction: {
              type: 'string',
              description: 'Position instruction',
              example: 'Focus on technical leadership, problem-solving in complex environments.',
            },
            level: {
              type: 'integer',
              description: 'Position level',
              example: 5,
            },
            is_active: {
              type: 'boolean',
              description: 'Position active status',
              example: true,
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
        PositionList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Position',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 10,
                },
                page: {
                  type: 'integer',
                  example: 1,
                },
                pageSize: {
                  type: 'integer',
                  example: 10,
                },
                totalPages: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
        },
        Language: {
          type: 'object',
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
              description: 'Language ID',
              example: '60d21b4667d0d8992e610c85',
            },
            name: {
              type: 'string',
              description: 'Language name',
              example: 'JavaScript',
            },
            slug: {
              type: 'string',
              description: 'URL-friendly identifier',
              example: 'javascript',
            },
            designed_by: {
              type: 'string',
              description: 'Language designer',
              example: 'Brendan Eich',
            },
            first_appeared: {
              type: 'integer',
              description: 'Year of first appearance',
              example: 1995,
            },
            paradigm: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Programming paradigms',
              example: ['event-driven', 'functional', 'imperative'],
            },
            usage: {
              type: 'string',
              description: 'Common usage areas',
              example: 'Front-end web, back-end (Node.js), mobile apps',
            },
            popularity_rank: {
              type: 'integer',
              description: 'Popularity ranking',
              example: 2,
            },
            type_system: {
              type: 'string',
              description: 'Type system characteristics',
              example: 'dynamic, weak',
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
        LanguageList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Language',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 10,
                },
                page: {
                  type: 'integer',
                  example: 1,
                },
                pageSize: {
                  type: 'integer',
                  example: 10,
                },
                totalPages: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
        },
        Topic: {
          type: 'object',
          required: ['title', 'difficulty', 'popularity', 'suitable_level', 'description'],
          properties: {
            _id: {
              type: 'string',
              description: 'Topic ID',
              example: '60d21b4667d0d8992e610c85',
            },
            title: {
              type: 'string',
              description: 'Topic title',
              example: 'JavaScript',
            },
            difficulty: {
              type: 'integer',
              description: 'Topic difficulty level (1-5)',
              example: 3,
            },
            popularity: {
              type: 'string',
              description: 'Topic popularity',
              example: 'high',
              enum: ['low', 'medium', 'high'],
            },
            suitable_level: {
              type: 'string',
              description: 'Suitable experience level',
              example: 'junior',
              enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'],
            },
            description: {
              type: 'string',
              description: 'Topic description',
              example:
                'JavaScript is a programming language that is one of the core technologies of the World Wide Web.',
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
        TopicList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Topic',
              },
            },
          },
        },
        Candidate: {
          type: 'object',
          required: ['full_name', 'email', 'phone_number', 'interview_level'],
          properties: {
            _id: {
              type: 'string',
              description: 'Candidate ID',
              example: '60d21b4667d0d8992e610c85',
            },
            full_name: {
              type: 'string',
              description: 'Full name of the candidate',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address',
              example: 'john.doe@example.com',
            },
            phone_number: {
              type: 'string',
              description: 'Phone number',
              example: '+1234567890',
            },
            interview_level: {
              type: 'string',
              description: 'Interview level',
              example: 'junior',
              enum: ['intern', 'fresher', 'junior', 'middle', 'senior', 'lead'],
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
        CandidateList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Candidate',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 10,
                },
                page: {
                  type: 'integer',
                  example: 1,
                },
                pageSize: {
                  type: 'integer',
                  example: 10,
                },
                totalPages: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
        },
        Question: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Question ID',
              example: '60d21b4667d0d8992e610c85',
            },
            question: {
              type: 'string',
              description: 'Question text',
              example: 'What is the difference between let and var in JavaScript?',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'Answer options',
              example: [
                'let is block-scoped, var is function-scoped',
                'let cannot be redeclared, var can be redeclared',
                'let is hoisted, var is not hoisted',
                'There is no difference',
              ],
            },
            correct_answer: {
              type: 'array',
              items: {
                type: 'number',
              },
              description: 'Indices of correct answers (0-based)',
              example: [0, 1],
            },
            explanation: {
              type: 'string',
              description: 'Explanation of the correct answer',
              example:
                'let is block-scoped while var is function-scoped. Also, let cannot be redeclared in the same scope.',
            },
            topic: {
              type: 'string',
              description: 'Topic of the question',
              example: 'JavaScript',
            },
            difficulty: {
              type: 'integer',
              description: 'Difficulty level (1-5)',
              example: 3,
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
        QuestionList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Question',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 10,
                },
                page: {
                  type: 'integer',
                  example: 1,
                },
                pageSize: {
                  type: 'integer',
                  example: 10,
                },
                totalPages: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
        },
        Submission: {
          type: 'object',
          required: ['candidate_id'],
          properties: {
            _id: {
              type: 'string',
              description: 'Submission ID',
              example: '60d21b4667d0d8992e610c85',
            },
            candidate_id: {
              type: 'string',
              description: 'Candidate ID',
              example: '60d21b4667d0d8992e610c85',
            },
            answers: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question_id: {
                    type: 'string',
                    description: 'Question ID',
                    example: '60d21b4667d0d8992e610c85',
                  },
                  selected_options: {
                    type: 'array',
                    items: {
                      type: 'number',
                    },
                    description: 'Indices of selected options',
                    example: [1, 3],
                  },
                  skipped: {
                    type: 'boolean',
                    description: 'Whether the question was skipped',
                    example: false,
                  },
                },
              },
              description: 'Answers to questions',
            },
            score: {
              type: 'number',
              description: 'Overall score',
              example: 85.5,
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
        SubmissionList: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Submission',
              },
            },
            pagination: {
              type: 'object',
              properties: {
                total: {
                  type: 'integer',
                  example: 10,
                },
                page: {
                  type: 'integer',
                  example: 1,
                },
                pageSize: {
                  type: 'integer',
                  example: 10,
                },
                totalPages: {
                  type: 'integer',
                  example: 1,
                },
              },
            },
          },
        },
        // Common response schemas
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
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  example: 'VALIDATION_ERROR',
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                  example: ['Field is required', 'Invalid format'],
                },
              },
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
            errors: {
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
            pageSize: {
              type: 'integer',
              description: 'Number of items per page',
              example: 10,
            },
            totalPages: {
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
