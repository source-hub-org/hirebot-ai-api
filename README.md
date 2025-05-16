![HireBot AI API](./assets/project.jpeg)

# HireBot AI API

The backend service of HireBot AI, responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates. Built with Node.js (v18+), using Express (v5.1.0) for RESTful APIs, MongoDB (v6.16.0) for data storage, and Redis for job queue management. Supports containerized deployment with Docker and Nginx.

## Features

- Generate technical interview questions using Google's Gemini AI
- Store and retrieve questions from MongoDB (v6.16.0)
- Asynchronous question generation with Redis-based job queue
- Manage interview topics and positions through commands and API
- RESTful API for quiz, topic, position, language, candidate, submission, and instrument management
- Flexible question search API with support for multiple topics, languages, and positions
- Assessment instruments for personality and skill evaluation
- Logic questions with multiple-choice and open-ended formats
- Tagging system for organizing questions by category
- Comprehensive validation and error handling
- Swagger API documentation with complete schema definitions
- Extensive test coverage with Jest (v29.7.0)
- Pagination support for listing resources
- Docker and Docker Compose support for easy deployment

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.16.0 or higher)
- Redis (for job queue management)
- Google Gemini API key (see [Getting a Gemini API Key](#getting-a-gemini-api-key))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/thangtran3112/hirebot-ai-api.git
   cd hirebot-ai-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory based on the `.env.example` file:

   ```
   APP_PORT=8000
   PORT=3000
   MONGODB_URI=mongodb://mongodb:27017
   DB_NAME=hirebot_db
   JWT_SECRET=secret

   SWAGGER_URL=http://localhost:8000

   # Redis Configuration
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_PASSWORD=
   JOB_POLLING_INTERVAL=5000

   # Gemini AI Configuration
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-2.0-flash
   GEMINI_API_BASE_URL=https://generativelanguage.googleapis.com/v1beta
   GEMINI_MAX_OUTPUT_TOKENS=8192
   GEMINI_TEMPERATURE=0.7
   GEMINI_TMP_DIR=/tmp
   PAGE_SIZE_EXISTING_QUESTIONS=1000
   ```

4. Start all services using Docker Compose (recommended):

   ```bash
   # Start all services (MongoDB, Redis, Node.js app, and Nginx)
   docker-compose up -d
   ```

   Alternatively, you can start only MongoDB and Redis:

   ```bash
   # Start MongoDB
   cd docker/mongodb
   docker-compose up -d

   # Start Redis
   cd ../redis
   docker-compose up -d
   ```

5. Start the server:

   ```bash
   npm start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

### Getting a Gemini API Key

To use the Google Gemini AI features, you'll need to obtain an API key:

1. Visit [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Create API key"
4. Give your key a name (e.g., "HireBot AI")
5. Copy the generated API key
6. Add it to your `.env` file as `GEMINI_API_KEY=your_api_key_here`

Note: Keep your API key secure and never commit it to version control.

## OAuth2 Authentication

The API supports OAuth2 authentication for secure access to protected endpoints. The implementation follows the OAuth2 specification and supports the following grant types:

- Password Grant
- Refresh Token Grant
- Authorization Code Grant

### OAuth2 Configuration

Add the following OAuth2 configuration to your `.env` file:

```
# OAuth2 Configuration
OAUTH_ACCESS_TOKEN_LIFETIME=3600
OAUTH_REFRESH_TOKEN_LIFETIME=1209600
OAUTH_AUTHORIZATION_CODE_LIFETIME=300
OAUTH_ALLOW_BEARER_TOKENS_IN_QUERY=false
OAUTH_ALLOW_EXTENDED_TOKEN_ATTRIBUTES=false
OAUTH_REQUIRE_CLIENT_AUTH_PASSWORD=true
OAUTH_REQUIRE_CLIENT_AUTH_REFRESH_TOKEN=true
OAUTH_REQUIRE_CLIENT_AUTH_AUTHORIZATION_CODE=true

# Default OAuth2 Client (for testing)
OAUTH_DEFAULT_CLIENT_ID=test-client
OAUTH_DEFAULT_CLIENT_SECRET=test-secret
OAUTH_DEFAULT_REDIRECT_URI=http://localhost:3000/oauth/callback

# Multiple OAuth2 Clients (JSON format)
# OAUTH_CLIENTS=[{"id":"client1","secret":"secret1","grants":["password","refresh_token"],"redirectUris":["http://localhost:3000/callback"]}]
```

### How to Make Client App Work with OAuth2

#### 1. Password Grant Flow

For username/password authentication:

```javascript
// Client-side code
async function getToken() {
  const response = await fetch('http://your-api-url/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'test-client',
      client_secret: 'test-secret',
      username: 'user@example.com',
      password: 'userpassword',
    }),
  });

  const tokenData = await response.json();
  // Store tokens securely
  localStorage.setItem('access_token', tokenData.access_token);
  localStorage.setItem('refresh_token', tokenData.refresh_token);

  return tokenData;
}
```

#### 2. Using Access Token for API Requests

```javascript
// Client-side code
async function fetchProtectedResource() {
  const accessToken = localStorage.getItem('access_token');

  const response = await fetch('http://your-api-url/api/protected-resource', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return await response.json();
}
```

#### 3. Refreshing Access Token

```javascript
// Client-side code
async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');

  const response = await fetch('http://your-api-url/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: 'test-client',
      client_secret: 'test-secret',
      refresh_token: refreshToken,
    }),
  });

  const tokenData = await response.json();
  // Update stored tokens
  localStorage.setItem('access_token', tokenData.access_token);
  localStorage.setItem('refresh_token', tokenData.refresh_token);

  return tokenData;
}
```

#### 4. Authorization Code Flow (for web applications)

Step 1: Redirect user to authorization page:

```javascript
// Client-side code
function redirectToAuth() {
  const authUrl = 'http://your-api-url/api/oauth/authorize';
  const clientId = 'test-client';
  const redirectUri = 'http://your-app-url/callback';
  const responseType = 'code';
  const state = generateRandomString(); // For CSRF protection

  // Store state for validation when the user returns
  localStorage.setItem('oauth_state', state);

  // Redirect to authorization page
  window.location.href = `${authUrl}?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&state=${state}`;
}
```

Step 2: Handle the callback and exchange code for token:

```javascript
// Client-side code (on callback page)
async function handleCallback() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');

  // Verify state to prevent CSRF attacks
  const savedState = localStorage.getItem('oauth_state');
  if (state !== savedState) {
    throw new Error('Invalid state parameter');
  }

  // Exchange code for token
  const response = await fetch('http://your-api-url/api/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: 'test-client',
      client_secret: 'test-secret',
      code: code,
      redirect_uri: 'http://your-app-url/callback',
    }),
  });

  const tokenData = await response.json();
  // Store tokens securely
  localStorage.setItem('access_token', tokenData.access_token);
  localStorage.setItem('refresh_token', tokenData.refresh_token);

  return tokenData;
}
```

### Securing Your API Routes

To protect your API routes with OAuth2 authentication, use the OAuth middleware:

```javascript
// Server-side code (in your route file)
const { authenticate } = require('../middlewares/oauthMiddleware');

// Protect a route with OAuth2
router.get('/protected-resource', authenticate(), (req, res) => {
  // Access is granted only if a valid access token is provided
  res.json({ message: 'This is a protected resource', user: req.user });
});

// Optional authentication (user info is available if authenticated)
router.get('/optional-auth', authenticate({ required: false }), (req, res) => {
  if (req.user) {
    res.json({ message: 'You are authenticated', user: req.user });
  } else {
    res.json({ message: 'You are not authenticated' });
  }
});

// Require specific scope
router.get('/admin-resource', authenticate({ scope: 'admin' }), (req, res) => {
  // Access is granted only if token has 'admin' scope
  res.json({ message: 'This is an admin resource', user: req.user });
});
```

## Project Structure

```
hirebot-ai-api/
├── src/
│   ├── commands/       # CLI commands
│   │   ├── index.js
│   │   ├── languageCommands.js    # Language management commands
│   │   ├── positionCommands.js    # Position management commands
│   │   └── topicCommands.js       # Topic management commands
│   ├── config/         # Configuration files
│   │   ├── question-format.json   # Question format schema
│   │   └── swagger.js             # Swagger configuration
│   ├── controllers/    # Request handlers
│   │   ├── candidates/            # Candidate controllers
│   │   ├── health-check/          # Health check controllers
│   │   ├── instrument-tags/       # Instrument tag controllers
│   │   ├── instruments/           # Instrument controllers
│   │   ├── languages/             # Language controllers
│   │   ├── positions/             # Position controllers
│   │   ├── questions/             # Question controllers
│   │   ├── submissions/           # Submission controllers
│   │   └── topics/                # Topic controllers
│   ├── models/         # Data models
│   │   ├── candidateModel.js      # Candidate schema and validation
│   │   ├── instrumentModel.js     # Instrument schema and validation
│   │   ├── instrumentTagModel.js  # Instrument tag schema and validation
│   │   ├── jobModel.js            # Job queue schema
│   │   ├── languageModel.js       # Language schema and validation
│   │   ├── logicQuestionModel.js  # Logic question schema and validation
│   │   ├── logicTagModel.js       # Logic tag schema and validation
│   │   ├── positionModel.js       # Position schema and validation
│   │   ├── questionModel.js       # Question schema and validation
│   │   └── submissionModel.js     # Submission schema and validation
│   ├── repository/     # Data access layer
│   │   ├── baseRepository.js      # Base repository with common operations
│   │   ├── candidateRepository.js # Candidate data operations
│   │   ├── instrumentRepository.js # Instrument data operations
│   │   ├── instrumentTagRepository.js # Instrument tag data operations
│   │   ├── jobRepository.js       # Job queue operations
│   │   ├── languageRepository.js  # Language data operations
│   │   ├── logicQuestionRepository.js # Logic question data operations
│   │   ├── logicTagRepository.js  # Logic tag data operations
│   │   ├── positionRepository.js  # Position data operations
│   │   ├── questionRepository.js  # Question data operations
│   │   ├── submissionRepository.js # Submission data operations
│   │   └── topicRepository.js     # Topic data operations
│   ├── routes/         # API routes
│   │   ├── candidates/            # Candidate API endpoints
│   │   ├── health-check/          # Health check endpoints
│   │   ├── instrument-tags/       # Instrument tag API endpoints
│   │   ├── instruments/           # Instrument API endpoints
│   │   ├── languages/             # Language API endpoints
│   │   ├── logic-questions/       # Logic question API endpoints
│   │   ├── logic-tags/            # Logic tag API endpoints
│   │   ├── positions/             # Position API endpoints
│   │   ├── questions/             # Question generation endpoints
│   │   ├── submissions/           # Submission API endpoints
│   │   ├── topics/                # Topic API endpoints
│   │   └── index.js               # Route registration
│   ├── service/        # Business logic
│   │   ├── gemini/                # Gemini AI integration
│   │   │   ├── geminiClient.js    # Gemini API client
│   │   │   ├── quizQuestionCreator.js # Quiz creation orchestrator
│   │   │   └── quiz/              # Quiz generation modules
│   │   │       ├── contentValidator.js # Main validation module
│   │   │       ├── extractors.js       # JSON extraction utilities
│   │   │       ├── fileOperations.js   # File handling utilities
│   │   │       ├── parsers.js          # JSON parsing utilities
│   │   │       ├── promptBuilder.js    # AI prompt construction
│   │   │       └── validators.js       # Question validation utilities
│   │   ├── instrumentService.js        # Instrument service
│   │   ├── instrumentTagService.js     # Instrument tag service
│   │   ├── jobProcessorService.js      # Background job processor
│   │   ├── languageService.js          # Language service
│   │   ├── logicQuestionGetService.js  # Logic question retrieval service
│   │   ├── logicQuestionQueryService.js # Logic question query service
│   │   ├── logicQuestionService.js     # Logic question management service
│   │   ├── logicTagService.js          # Logic tag service
│   │   ├── positionsService.js         # Positions service
│   │   ├── questionGenerationService.js # Question generation service
│   │   ├── questionRequestService.js   # Async question request service
│   │   ├── questionSearchService.js    # Question search service
│   │   └── redisService.js             # Redis queue service
│   └── utils/          # Utility functions
│       ├── candidateValidator.js       # Candidate validation utilities
│       ├── ensureDirectories.js        # Directory creation utilities
│       ├── errorResponseHandler.js     # Error handling utilities
│       ├── fileParser.js               # File reading utilities
│       ├── formatSlug.js               # Slug formatting utilities
│       ├── generateRequestValidator.js # Request validation
│       ├── instrumentQueryBuilder.js   # Instrument query builder
│       ├── languageValidator.js        # Language validation utilities
│       ├── logger.js                   # Logging utilities
│       ├── logicQuestionQueryBuilder.js # Logic question query builder
│       ├── paginationUtils.js          # Pagination utilities
│       ├── positionUtils.js            # Position-related utilities
│       ├── positionValidator.js        # Position validation utilities
│       ├── questionSearchQueryBuilder.js # Search query builder
│       ├── questionSearchValidator.js    # Search validation
│       ├── questionValidator.js        # Question validation utilities
│       ├── randomSortingUtils.js       # Random sorting utilities
│       ├── redisQueueHelper.js         # Redis queue utilities
│       ├── submissionEnricher.js       # Submission data enrichment
│       ├── submissionValidator.js      # Submission validation utilities
│       ├── topicValidator.js           # Topic validation utilities
│       └── validateObjectId.js         # MongoDB ObjectId validation
├── test/               # Test files
│   ├── candidates/     # Candidate tests
│   ├── files/          # File operation tests
│   ├── gemini/         # Gemini integration tests
│   ├── general/        # General utility tests
│   ├── instruments/    # Instrument tests
│   ├── languages/      # Language tests
│   ├── questions/      # Question generation tests
│   ├── repositories/   # Repository tests
│   ├── routes/         # API route tests
│   ├── service/        # Service tests
│   ├── submissions/    # Submission tests
│   ├── topics/         # Topic tests
│   ├── utils/          # Utility tests
│   └── validators/     # Validation tests
├── docker/             # Docker configuration
│   ├── mongodb/        # MongoDB Docker setup
│   └── redis/          # Redis Docker setup
├── data/               # Sample data files
│   ├── sample-candidate.json # Sample candidate data
│   ├── sample-positions.json # Sample positions data
│   └── sample-topics.json    # Sample topics data
├── tmp/                # Temporary data files
│   └── languages.json  # Sample languages data
├── .env.example        # Example environment variables
├── .github/workflows/  # CI/CD configuration
├── assets/             # Project assets
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker build configuration
├── nginx.conf          # Nginx configuration for Docker
├── jest.config.js      # Jest test configuration
└── package.json        # Project metadata and dependencies
```

## Architecture

The project follows a layered architecture with MVC pattern:

1. **Models Layer** (`models/`): Defines data schemas, validation rules, and default values for database collections.

2. **Controllers Layer** (`controllers/`): Handles the application logic, processes requests from routes, and prepares responses.

3. **Routes Layer** (`routes/`): Defines API endpoints, handles HTTP requests and responses, and routes to appropriate controllers.

4. **Service Layer** (`service/`): Contains the core business logic, including:

   - Gemini AI integration for generating questions
   - Quiz content validation and processing
   - Asynchronous job processing with Redis
   - Data transformation and preparation
   - Search functionality

5. **Repository Layer** (`repository/`): Manages data access and persistence with MongoDB, providing an abstraction over database operations.

6. **Utility Layer** (`utils/`): Provides common utilities like logging, file parsing, validation, and pagination.

7. **Commands Layer** (`commands/`): Handles CLI commands for administrative tasks like initializing topics and positions.

### Asynchronous Processing Architecture

The application implements an asynchronous processing architecture for question generation:

1. **Request Handling**:

   - Client requests question generation via API
   - Request is validated and a job is created
   - Job is added to Redis queue
   - Client receives a job ID for status tracking

2. **Job Processing**:

   - Background service polls Redis queue for pending jobs
   - Jobs are processed asynchronously by the job processor service
   - Results are stored in MongoDB
   - Job status is updated in Redis

3. **Result Retrieval**:
   - Client can check job status using the job ID
   - When job is complete, client can retrieve the generated questions

### Question Search API

The application provides a flexible search API for retrieving questions based on various criteria:

1. **Flexible Filtering**:

   - All search parameters (topic, language, position) are optional
   - Support for multiple values in each parameter (comma-separated)
   - Case-insensitive search for all text fields

2. **Search Parameters**:

   - `topic`: Filter by one or more topics (e.g., `JavaScript,React,Node.js`)
   - `language`: Filter by one or more programming languages (e.g., `JavaScript,TypeScript`)
   - `position`: Filter by one or more experience levels (e.g., `junior,middle,senior`)

3. **Sorting and Pagination**:

   - `sort_by`: Field to sort by (`question`, `category`, `createdAt`, or `random`)
   - `sort_direction`: Sort direction (`asc` or `desc`)
   - `page` and `page_size`: Standard pagination parameters

4. **Response Modes**:

   - `mode`: Controls the level of detail in the response
     - `full`: All question fields (default)
     - `compact`: Excludes correct answers and explanations
     - `minimalist`: Only includes question ID and text

5. **Additional Features**:
   - `ignore_question_ids`: Exclude specific questions from results

Example request:

```
GET /api/questions/search?topic=JavaScript,React&language=JavaScript&position=junior,middle&sort_by=random&page=1&page_size=10&mode=compact
```

### Docker Deployment

The application can be deployed using Docker and Docker Compose:

1. Make sure Docker and Docker Compose are installed on your system
2. Configure your `.env` file with appropriate settings
3. Build and start all services:

```bash
docker-compose up -d
```

This will start:

- MongoDB container
- Redis container
- Node.js application container
- Nginx container (serving as a reverse proxy)

The application will be accessible at `http://localhost:8000` (or the port specified in your `.env` file as `APP_PORT`).

To view logs:

```bash
docker-compose logs -f
```

To stop all services:

```bash
docker-compose down
```

### Quiz Generation Module

The quiz generation module is organized into specialized components:

- **geminiClient.js**: Handles communication with Google's Gemini AI API
- **quizQuestionCreator.js**: Orchestrates the question generation process
- **promptBuilder.js**: Constructs AI prompts based on topic and requirements
- **extractors.js**: Extracts JSON content from various formats (code blocks, raw text)
- **parsers.js**: Parses and validates JSON structure for question data
- **validators.js**: Validates and normalizes question content (options, answers, etc.)
- **contentValidator.js**: Orchestrates the validation process using the specialized modules
- **fileOperations.js**: Handles temporary file operations for large responses

## Commands

The project includes CLI commands for administrative tasks:

### Topic Management

Initialize topics from a JSON file:

```bash
npm run command app:init-topics ./tmp/topics.json
```

The JSON file should have the following structure:

```json
{
  "topics": [
    {
      "title": "Topic Title",
      "difficulty": 1,
      "popularity": "low",
      "suitable_level": "intern",
      "description": "Topic description"
    },
    {
      "title": "Another Topic",
      "difficulty": 2,
      "popularity": "high",
      "suitable_level": "junior",
      "description": "Another topic description"
    }
  ]
}
```

### Position Management

Initialize positions from a JSON file:

```bash
npm run command app:init-positions ./tmp/positions.json
```

The command supports two JSON file formats:

#### Format 1: Direct Array of Position Objects

```json
[
  {
    "slug": "intern",
    "title": "Intern",
    "description": "Able to understand basic programming syntax, simple data types, variables, and basic control structures such as if-else and loops. Limited or no real-world coding experience.",
    "instruction": "Focus on verifying basic logical thinking, programming mindset, and willingness to learn. Suitable for candidates undergoing internship programs.",
    "level": 1,
    "is_active": true
  },
  {
    "slug": "fresher",
    "title": "Fresher",
    "description": "Has basic knowledge of software development concepts, simple algorithms, and can complete basic coding exercises. Familiar with at least one programming language.",
    "instruction": "Assess candidate's ability to apply theoretical knowledge to simple tasks and their potential to grow with guidance.",
    "level": 2,
    "is_active": true
  }
]
```

#### Format 2: Object with Positions Array

```json
{
  "positions": [
    {
      "slug": "frontend-developer",
      "title": "Frontend Developer",
      "description": "Responsible for implementing visual elements that users see and interact with in a web application.",
      "instruction": "Create responsive and user-friendly interfaces using modern frontend frameworks.",
      "level": 4,
      "is_active": true
    },
    {
      "slug": "backend-developer",
      "title": "Backend Developer",
      "description": "Responsible for server-side web application logic and integration of the work front-end developers do.",
      "instruction": "Design and implement efficient APIs and database structures.",
      "level": 5,
      "is_active": true
    }
  ]
}
```

#### Required Fields for Position Objects

Each position object must include the following fields:

- `slug`: A unique identifier for the position (string)
- `title`: The display name of the position (string)
- `description`: A detailed description of the position (string)
- `instruction`: Guidelines for evaluating candidates at this position level (string)
- `level`: The numerical level/seniority of the position (number)

Optional fields:

- `is_active`: Whether the position is active (boolean, defaults to true)

### Language Management

Initialize programming languages from a JSON file:

```bash
npm run command app:init-languages ./tmp/languages.json
```

The command supports two JSON file formats:

#### Format 1: Direct Array of Language Objects (Recommended)

```json
[
  {
    "name": "Python",
    "designed_by": "Guido van Rossum",
    "first_appeared": 1991,
    "paradigm": ["object-oriented", "imperative", "functional", "procedural"],
    "usage": "AI, data science, web development, scripting",
    "popularity_rank": 1,
    "type_system": "dynamic, strong"
  },
  {
    "name": "JavaScript",
    "designed_by": "Brendan Eich",
    "first_appeared": 1995,
    "paradigm": ["event-driven", "functional", "imperative"],
    "usage": "Front-end web, back-end (Node.js), mobile apps",
    "popularity_rank": 2,
    "type_system": "dynamic, weak"
  }
]
```

#### Format 2: Object with Languages Array

```json
{
  "languages": [
    {
      "name": "Python",
      "designed_by": "Guido van Rossum",
      "first_appeared": 1991,
      "paradigm": ["object-oriented", "imperative", "functional", "procedural"],
      "usage": "AI, data science, web development, scripting",
      "popularity_rank": 1,
      "type_system": "dynamic, strong"
    },
    {
      "name": "JavaScript",
      "designed_by": "Brendan Eich",
      "first_appeared": 1995,
      "paradigm": ["event-driven", "functional", "imperative"],
      "usage": "Front-end web, back-end (Node.js), mobile apps",
      "popularity_rank": 2,
      "type_system": "dynamic, weak"
    }
  ]
}
```

#### Required Fields for Language Objects

Each language object must include the following fields:

- `name`: The name of the programming language (string)
- `designed_by`: The designer(s) of the language (string)
- `first_appeared`: The year the language first appeared (number, >= 1940)
- `paradigm`: Programming paradigms supported by the language (array of strings)
- `usage`: Common usage areas for the language (string)
- `popularity_rank`: Popularity ranking of the language (number, >= 1)
- `type_system`: Type system characteristics (string)

Optional fields:

- `slug`: URL-friendly identifier (string, generated from name if not provided)

## API Documentation

This project uses Swagger to document the API endpoints. The documentation is automatically generated from JSDoc comments in the route files.

### Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

### Available Endpoints

#### Questions API

- `POST /api/questions/generate` - Generate new questions synchronously
- `POST /api/questions/request` - Request asynchronous question generation
- `GET /api/questions/search` - Search for questions

#### Logic Questions API

- `GET /api/logic-questions` - Get all logic questions with pagination
- `GET /api/logic-questions/{id}` - Get a logic question by ID
- `POST /api/logic-questions` - Create a new logic question
- `PUT /api/logic-questions/{id}` - Update a logic question
- `DELETE /api/logic-questions/{id}` - Delete a logic question
- `GET /api/logic-questions/tag/{tagId}` - Get logic questions by tag ID

#### Logic Tags API

- `GET /api/logic-tags` - Get all logic tags with pagination
- `GET /api/logic-tags/{id}` - Get a logic tag by ID
- `POST /api/logic-tags` - Create a new logic tag
- `PUT /api/logic-tags/{id}` - Update a logic tag
- `DELETE /api/logic-tags/{id}` - Delete a logic tag

#### Topics API

- `GET /api/topics` - Get all available topics

#### Positions API

- `GET /api/positions` - Get all positions with pagination
- `GET /api/positions/{id}` - Get a position by ID
- `POST /api/positions` - Create a new position
- `PUT /api/positions/{id}` - Update a position
- `DELETE /api/positions/{id}` - Delete a position

#### Languages API

- `GET /api/languages` - Get all programming languages with pagination
- `GET /api/languages/{id}` - Get a programming language by ID
- `POST /api/languages` - Create a new programming language
- `PUT /api/languages/{id}` - Update a programming language
- `DELETE /api/languages/{id}` - Delete a programming language

#### Candidates API

- `GET /api/candidates` - Get all candidates with pagination
- `GET /api/candidates/{id}` - Get a candidate by ID
- `POST /api/candidates` - Create a new candidate
- `PUT /api/candidates/{id}` - Update a candidate
- `DELETE /api/candidates/{id}` - Delete a candidate

#### Submissions API

- `POST /api/submissions` - Create a new submission
- `GET /api/submissions/{id}` - Get a submission by ID
- `GET /api/submissions/candidate/{candidateId}` - Get submissions by candidate ID

#### Instruments API

- `GET /api/instruments` - Get all instruments with pagination
- `GET /api/instruments/:id` - Get an instrument by ID
- `GET /api/instruments/tag/:tagId` - Get instruments by tag ID
- `POST /api/instruments` - Create a new instrument
- `PUT /api/instruments/:id` - Update an instrument
- `DELETE /api/instruments/:id` - Delete an instrument

#### Instrument Tags API

- `GET /api/instrument-tags` - Get all instrument tags with pagination
- `GET /api/instrument-tags/:id` - Get an instrument tag by ID
- `POST /api/instrument-tags` - Create a new instrument tag
- `PUT /api/instrument-tags/:id` - Update an instrument tag
- `DELETE /api/instrument-tags/:id` - Delete an instrument tag

#### Health Check API

- `GET /api/health` - Check basic API health status
- `GET /api/health/database` - Check database connection status

### Adding Documentation to Endpoints

To document an endpoint, add JSDoc comments with Swagger annotations above the route handler. For example:

```javascript
/**
 * @swagger
 * /api/resource:
 *   get:
 *     summary: Brief description of the endpoint
 *     description: Detailed description of what the endpoint does
 *     tags: [Category]
 *     parameters:
 *       - in: query
 *         name: param
 *         schema:
 *           type: string
 *         description: Description of the parameter
 *     responses:
 *       200:
 *         description: Success response description
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 property:
 *                   type: string
 *                   example: example value
 */
router.get('/resource', (req, res) => {
  // Route handler code
});
```

For more information on Swagger annotations, refer to the [swagger-jsdoc documentation](https://github.com/Surnet/swagger-jsdoc/blob/master/docs/GETTING-STARTED.md).

## Data Models

### Candidate Model

The candidate model defines the structure for storing candidate information:

- Required fields: `full_name`, `email`, `phone_number`, `interview_level`
- Optional fields include personal information, education, experience, skills, and interview details

### Submission Model

The submission model defines the structure for storing candidate quiz submissions:

- Required fields: `candidate_id`
- Contains arrays of answers to questions, essay responses, and review information
- Each answer includes the question ID, selected option, and skip status

### Question Model

The question model defines the structure for storing quiz questions:

- Required fields: `question`, `options`, `correct_answer`, `explanation`, `topic`, `difficulty`
- Supports multiple-choice questions with single or multiple correct answers
- Includes detailed explanations for correct answers
- Associated with specific topics and difficulty levels

### Logic Question Model

The logic question model defines the structure for storing logical reasoning questions:

- Required fields: `question`, `level`, `tag_ids`, `type`, `answer_explanation`
- Supports two question types: `multiple_choice` and `open_question`
- For multiple-choice questions, includes an array of choices with correctness flags
- Associated with one or more logic tags for categorization
- Includes difficulty level (1-6) and detailed answer explanations

### Logic Tag Model

The logic tag model defines categories for logic questions:

- Required fields: `name`, `slug`
- Optional field: `description`
- Used to organize and filter logic questions by category (e.g., algorithms, data structures)

### Instrument Model

The instrument model defines the structure for storing assessment instruments:

- Required fields: `questionId`, `questionText`, `type`, `tags`
- Supports multiple instrument types: `scale`, `multiple-choice`, `open-ended`, `boolean`
- Options are required for scale and multiple-choice types
- Each instrument is associated with one or more instrument tags

### Instrument Tag Model

The instrument tag model defines categories for assessment instruments:

- Required fields: `name`, `description`
- Used to organize and filter instruments by category (e.g., personality, technical skills)

### Job Model

The job model defines the structure for asynchronous job processing:

- Required fields: `type`, `payload`
- Tracks job status through states: `new`, `pending`, `processing`, `done`, `failed`
- Used for background processing of resource-intensive operations like question generation

## Testing

The project includes comprehensive unit and integration tests using Jest.

### Running Tests

Run all tests:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Generate and open coverage report:

```bash
npm run test:coverage:report
```

Run specific test files:

```bash
npm test -- test/commands/languageCommands.test.js
```

### Test Coverage

The test coverage report shows the percentage of code covered by tests. The report is generated in HTML format and can be found in the `coverage` directory after running the coverage command.

The coverage report includes:

- **Statement Coverage**: Percentage of code statements executed during tests
- **Branch Coverage**: Percentage of code branches (if/else, switch cases) executed
- **Function Coverage**: Percentage of functions called during tests
- **Line Coverage**: Percentage of executable lines of code executed

The HTML report provides a detailed view of which lines are covered and which are not, helping you identify areas that need additional testing.

### Current Test Coverage

The project maintains high test coverage across critical components:

| Component   | Statement Coverage | Branch Coverage | Function Coverage | Line Coverage |
| ----------- | ------------------ | --------------- | ----------------- | ------------- |
| Commands    | 95.07%             | 83.92%          | 100%              | 95.07%        |
| Controllers | 90%+               | 85%+            | 95%+              | 90%+          |
| Models      | 85%+               | 80%+            | 90%+              | 85%+          |
| Services    | 87.78%             | 82.95%          | 85.71%            | 88.13%        |
| Utils       | 79.96%             | 75.39%          | 82.55%            | 79.77%        |

Key modules with 100% test coverage:

- commands/index.js
- commands/positionCommands.js
- commands/topicCommands.js
- controllers/topics/getAllTopicsController.js

The project aims to maintain at least 80% overall test coverage, with critical components having 90%+ coverage.

## Code Quality

Maintain code quality with the following commands:

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.
