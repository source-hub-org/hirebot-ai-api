![HireBot AI API](./assets/project.jpeg)

# HireBot AI API

The backend service of HireBot AI, responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates. Built with Node.js, using Express for RESTful APIs and MongoDB for data storage.

## Features

- Generate technical interview questions using Google's Gemini AI
- Store and retrieve questions from MongoDB
- Manage interview topics through commands and API
- RESTful API for quiz, topic, candidate, and submission management
- Comprehensive validation and error handling
- Swagger API documentation
- Extensive test coverage
- Pagination support for listing resources

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
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

3. Create a `.env` file in the root directory with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/hirebot
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Start the server:

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
│   ├── config/         # Configuration files
│   ├── models/         # Data models
│   │   ├── candidateModel.js  # Candidate schema and validation
│   │   └── submissionModel.js # Submission schema and validation
│   ├── repository/     # Data access layer
│   │   ├── baseRepository.js      # Base repository with common operations
│   │   ├── candidateRepository.js # Candidate data operations
│   │   ├── submissionRepository.js # Submission data operations
│   │   └── topicRepository.js     # Topic data operations
│   ├── routes/         # API routes
│   │   ├── candidateRoutes.js     # Candidate API endpoints
│   │   ├── healthCheckRoutes.js   # Health check endpoint
│   │   ├── questionRoutes.js      # Question generation endpoints
│   │   ├── submissionRoutes.js    # Submission API endpoints
│   │   └── topicRoutes.js         # Topic API endpoints
│   ├── service/        # Business logic
│   │   ├── gemini/     # Gemini AI integration
│   │   │   └── quiz/   # Quiz generation modules
│   │   │       ├── extractors.js       # JSON extraction utilities
│   │   │       ├── parsers.js          # JSON parsing utilities
│   │   │       ├── validators.js       # Question validation utilities
│   │   │       └── contentValidator.js # Main validation module
│   │   └── questionSearchService.js # Question search service
│   └── utils/          # Utility functions
│       ├── candidateValidator.js   # Candidate validation utilities
│       ├── fileParser.js           # File reading utilities
│       ├── logger.js               # Logging utilities
│       ├── paginationUtils.js      # Pagination utilities
│       ├── questionSearchQueryBuilder.js # Search query builder
│       ├── questionSearchValidator.js    # Search validation
│       ├── submissionEnricher.js   # Submission data enrichment
│       ├── submissionValidator.js  # Submission validation utilities
│       └── topicValidator.js       # Topic validation utilities
├── test/               # Test files
├── docker/             # Docker configuration
│   └── mongodb/        # MongoDB Docker setup
├── data/               # Sample data files
├── .env                # Environment variables (not in repo)
└── package.json        # Project metadata and dependencies
```

## Architecture

The project follows a layered architecture:

1. **Models Layer** (`models/`): Defines data schemas, validation rules, and default values for database collections.

2. **Commands Layer** (`commands/`): Handles CLI commands for administrative tasks like initializing topics.

3. **Routes Layer** (`routes/`): Handles HTTP requests and responses, input validation, and routing to appropriate services.

4. **Service Layer** (`service/`): Contains the business logic, including:

   - Gemini AI integration for generating questions
   - Quiz content validation and processing
   - Data transformation and preparation
   - Search functionality

5. **Repository Layer** (`repository/`): Manages data access and persistence with MongoDB.

6. **Utility Layer** (`utils/`): Provides common utilities like logging, file parsing, validation, and pagination.

### Quiz Generation Module

The quiz generation module is organized into specialized components:

- **extractors.js**: Extracts JSON content from various formats (code blocks, raw text)
- **parsers.js**: Parses and validates JSON structure for question data
- **validators.js**: Validates and normalizes question content (options, answers, etc.)
- **contentValidator.js**: Orchestrates the validation process using the specialized modules

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

## API Documentation

This project uses Swagger to document the API endpoints. The documentation is automatically generated from JSDoc comments in the route files.

### Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

### Available Endpoints

#### Questions API

- `POST /api/questions/generate` - Generate new questions
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

- `GET /api/health` - Check API health status

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
