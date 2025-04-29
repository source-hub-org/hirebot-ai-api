![HireBot AI API](./assets/project.jpeg)

# HireBot AI API

The backend service of HireBot AI, responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates. Built with Node.js, using Express for RESTful APIs, MongoDB for data storage, and Redis for job queue management.

## Features

- Generate technical interview questions using Google's Gemini AI
- Store and retrieve questions from MongoDB
- Asynchronous question generation with Redis-based job queue
- Manage interview topics and positions through commands and API
- RESTful API for quiz, topic, position, candidate, and submission management
- Comprehensive validation and error handling
- Swagger API documentation
- Extensive test coverage
- Pagination support for listing resources

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Redis (for job queue management)
- Google Gemini API key (see [Getting a Gemini API Key](#getting-a-gemini-api-key))

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/hirebot-ai-api.git
   cd hirebot-ai-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory based on the `.env.example` file:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=hirebot_db
   JWT_SECRET=secret

   # Redis Configuration
   REDIS_HOST=localhost
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

4. Start MongoDB and Redis using Docker (optional):

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

## Project Structure

```
hirebot-ai-api/
├── src/
│   ├── commands/       # CLI commands
│   │   ├── index.js
│   │   ├── topicCommands.js       # Topic management commands
│   │   └── positionCommands.js    # Position management commands
│   ├── config/         # Configuration files
│   │   ├── question-format.json   # Question format schema
│   │   └── swagger.js             # Swagger configuration
│   ├── controllers/    # Request handlers
│   │   ├── candidates/            # Candidate controllers
│   │   ├── health-check/          # Health check controllers
│   │   ├── questions/             # Question controllers
│   │   ├── submissions/           # Submission controllers
│   │   └── topics/                # Topic controllers
│   ├── models/         # Data models
│   │   ├── candidateModel.js      # Candidate schema and validation
│   │   ├── jobModel.js            # Job queue schema
│   │   └── submissionModel.js     # Submission schema and validation
│   ├── repository/     # Data access layer
│   │   ├── baseRepository.js      # Base repository with common operations
│   │   ├── candidateRepository.js # Candidate data operations
│   │   ├── jobRepository.js       # Job queue operations
│   │   ├── positionRepository.js  # Position data operations
│   │   ├── submissionRepository.js # Submission data operations
│   │   └── topicRepository.js     # Topic data operations
│   ├── routes/         # API routes
│   │   ├── candidates/            # Candidate API endpoints
│   │   ├── health-check/          # Health check endpoints
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
│   │   ├── jobProcessorService.js      # Background job processor
│   │   ├── questionGenerationService.js # Question generation service
│   │   ├── questionRequestService.js   # Async question request service
│   │   ├── questionSearchService.js    # Question search service
│   │   └── redisService.js             # Redis queue service
│   └── utils/          # Utility functions
│       ├── candidateValidator.js       # Candidate validation utilities
│       ├── ensureDirectories.js        # Directory creation utilities
│       ├── errorResponseHandler.js     # Error handling utilities
│       ├── fileParser.js               # File reading utilities
│       ├── generateRequestValidator.js # Request validation
│       ├── logger.js                   # Logging utilities
│       ├── paginationUtils.js          # Pagination utilities
│       ├── positionUtils.js            # Position-related utilities
│       ├── positionValidator.js        # Position validation utilities
│       ├── questionSearchQueryBuilder.js # Search query builder
│       ├── questionSearchValidator.js    # Search validation
│       ├── redisQueueHelper.js         # Redis queue utilities
│       ├── submissionEnricher.js       # Submission data enrichment
│       ├── submissionValidator.js      # Submission validation utilities
│       └── topicValidator.js           # Topic validation utilities
├── test/               # Test files
│   ├── candidates/     # Candidate tests
│   ├── files/          # File operation tests
│   ├── gemini/         # Gemini integration tests
│   ├── general/        # General utility tests
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
├── .env.example        # Example environment variables
├── .github/workflows/  # CI/CD configuration
├── assets/             # Project assets
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

#### Topics API

- `GET /api/topics` - Get all available topics

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

### Test Coverage

The test coverage report shows the percentage of code covered by tests. The report is generated in HTML format and can be found in the `coverage` directory after running the coverage command.

The coverage report includes:

- **Statement Coverage**: Percentage of code statements executed during tests
- **Branch Coverage**: Percentage of code branches (if/else, switch cases) executed
- **Function Coverage**: Percentage of functions called during tests
- **Line Coverage**: Percentage of executable lines of code executed

The HTML report provides a detailed view of which lines are covered and which are not, helping you identify areas that need additional testing.

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
