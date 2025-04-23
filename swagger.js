const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'HireBot AI API Documentation',
    description:
      'This microservice is designed as a read-only component within a microservices architecture. Its primary responsibility is to handle search queries and retrieve detailed information about specific entities (e.g., books, products, users).',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './openapi.json';
const endpointsFiles = ['./src/index.js']; // file gốc app của bạn

swaggerAutogen(outputFile, endpointsFiles, doc);
