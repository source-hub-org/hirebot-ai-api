# HireBot AI API

The backend service of HireBot AI, responsible for generating, storing, and managing AI-powered technical interview quizzes for developer candidates. Built with Node.js, using Express for RESTful APIs and MongoDB for data storage.

## Features

- Generate technical interview questions using Google's Gemini AI
- Store and retrieve questions from MongoDB
- RESTful API for quiz management
- Comprehensive validation and error handling
- Swagger API documentation
- Extensive test coverage

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
│   ├── config/         # Configuration files
│   ├── repository/     # Data access layer
│   ├── routes/         # API routes
│   ├── service/        # Business logic
│   │   └── gemini/     # Gemini AI integration
│   │       └── quiz/   # Quiz generation modules
│   │           ├── extractors.js    # JSON extraction utilities
│   │           ├── parsers.js       # JSON parsing utilities
│   │           ├── validators.js    # Question validation utilities
│   │           └── contentValidator.js # Main validation module
│   └── utils/          # Utility functions
├── test/               # Test files
├── .env                # Environment variables (not in repo)
└── package.json        # Project metadata and dependencies
```

## Architecture

The project follows a layered architecture:

1. **Routes Layer** (`routes/`): Handles HTTP requests and responses, input validation, and routing to appropriate services.

2. **Service Layer** (`service/`): Contains the business logic, including:

   - Gemini AI integration for generating questions
   - Quiz content validation and processing
   - Data transformation and preparation

3. **Repository Layer** (`repository/`): Manages data access and persistence with MongoDB.

4. **Utility Layer** (`utils/`): Provides common utilities like logging and directory management.

### Quiz Generation Module

The quiz generation module is organized into specialized components:

- **extractors.js**: Extracts JSON content from various formats (code blocks, raw text)
- **parsers.js**: Parses and validates JSON structure for question data
- **validators.js**: Validates and normalizes question content (options, answers, etc.)
- **contentValidator.js**: Orchestrates the validation process using the specialized modules

## API Documentation

This project uses Swagger to document the API endpoints. The documentation is automatically generated from JSDoc comments in the route files.

### Accessing the Documentation

Once the server is running, you can access the Swagger UI at:

```
http://localhost:3000/api-docs
```

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
