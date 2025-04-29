const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get port from environment variables or use default
const PORT = process.env.PORT || 3000;

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
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      schemas: {
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

  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
};

module.exports = { swaggerDocs };
