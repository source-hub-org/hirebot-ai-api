# API Reference

This document provides a comprehensive reference for all API endpoints available in the HireBot AI API.

## API Base URL

The base URL for all API endpoints is:

```
http://your-server-address:8000/api
```

## Authentication

Most API endpoints require authentication. See the [Authentication](./authentication.md) document for details on how to authenticate with the API.

## Available Endpoints

### Health Check

- `GET /health-check` - Check API health status

### Authentication

- `POST /oauth/token` - Get access token
- `POST /oauth/authorize` - Authorize client
- `POST /register` - Register a new user

### Users

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user
- `GET /users/me` - Get current user profile

### Questions

- `POST /questions/generate` - Generate new questions
- `GET /questions` - Get all questions
- `GET /questions/:id` - Get question by ID
- `PUT /questions/:id` - Update a question
- `DELETE /questions/:id` - Delete a question
- `GET /questions/search` - Search questions with filters

### Topics

- `GET /topics` - Get all topics
- `GET /topics/:id` - Get topic by ID
- `POST /topics` - Create a new topic
- `PUT /topics/:id` - Update a topic
- `DELETE /topics/:id` - Delete a topic

### Positions

- `GET /positions` - Get all positions
- `GET /positions/:id` - Get position by ID
- `POST /positions` - Create a new position
- `PUT /positions/:id` - Update a position
- `DELETE /positions/:id` - Delete a position

### Languages

- `GET /languages` - Get all languages
- `GET /languages/:id` - Get language by ID
- `POST /languages` - Create a new language
- `PUT /languages/:id` - Update a language
- `DELETE /languages/:id` - Delete a language

### Candidates

- `GET /candidates` - Get all candidates
- `GET /candidates/:id` - Get candidate by ID
- `POST /candidates` - Create a new candidate
- `PUT /candidates/:id` - Update a candidate
- `DELETE /candidates/:id` - Delete a candidate

### Submissions

- `GET /submissions` - Get all submissions
- `GET /submissions/:id` - Get submission by ID
- `POST /submissions` - Create a new submission
- `PUT /submissions/:id` - Update a submission
- `DELETE /submissions/:id` - Delete a submission

### Instruments

- `GET /instruments` - Get all assessment instruments
- `GET /instruments/:id` - Get instrument by ID
- `POST /instruments` - Create a new instrument
- `PUT /instruments/:id` - Update an instrument
- `DELETE /instruments/:id` - Delete an instrument

### Instrument Tags

- `GET /instrument-tags` - Get all instrument tags
- `GET /instrument-tags/:id` - Get instrument tag by ID
- `POST /instrument-tags` - Create a new instrument tag
- `PUT /instrument-tags/:id` - Update an instrument tag
- `DELETE /instrument-tags/:id` - Delete an instrument tag

### Logic Questions

- `GET /logic-questions` - Get all logic questions
- `GET /logic-questions/:id` - Get logic question by ID
- `POST /logic-questions` - Create a new logic question
- `PUT /logic-questions/:id` - Update a logic question
- `DELETE /logic-questions/:id` - Delete a logic question

### Logic Tags

- `GET /logic-tags` - Get all logic tags
- `GET /logic-tags/:id` - Get logic tag by ID
- `POST /logic-tags` - Create a new logic tag
- `PUT /logic-tags/:id` - Update a logic tag
- `DELETE /logic-tags/:id` - Delete a logic tag

## Request and Response Formats

All API endpoints accept and return JSON data. For detailed request and response schemas, refer to the Swagger documentation available at:

```
http://your-server-address:8000/api-docs
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (default: 1)
- `page_size` - Number of items per page (default: 20)

Example:

```
GET /api/questions?page=2&page_size=10
```

## Filtering and Sorting

Many list endpoints support filtering and sorting with query parameters:

- Filtering: Use field names as query parameters
- Sorting: Use `sort_by` and `sort_direction` parameters

Example:

```
GET /api/questions?topic=javascript&difficulty=medium&sort_by=createdAt&sort_direction=desc
```

## Error Handling

The API uses standard HTTP status codes to indicate the success or failure of requests:

- `200 OK` - The request was successful
- `201 Created` - A resource was successfully created
- `400 Bad Request` - The request was invalid
- `401 Unauthorized` - Authentication is required
- `403 Forbidden` - The client does not have permission
- `404 Not Found` - The requested resource was not found
- `500 Internal Server Error` - An error occurred on the server

Error responses include a JSON object with an `error` field containing a description of the error.
