const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
  },
  // Path to the API docs
  apis: ['./src/routes/*.js'], // Path to the API docs
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

  console.log(`Swagger docs available at http://localhost:3000/api-docs`);
};

module.exports = { swaggerDocs };
