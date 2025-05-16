# Development Guide

This guide provides information for developers working on the HireBot AI API project.

## Development Environment Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.16.0 or higher)
- Redis
- Git
- Docker and Docker Compose (optional)
- Code editor (VS Code recommended)

### Setting Up Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/thangtran3112/hirebot-ai-api.git
   cd hirebot-ai-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.development` file based on `.env.example`:
   ```
   APP_PORT=8000
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017
   DB_NAME=hirebot_db_dev
   JWT_SECRET=dev_secret
   
   SWAGGER_URL=http://localhost:8000
   
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

4. Start MongoDB and Redis:
   ```bash
   # Using Docker
   cd docker/mongodb
   docker-compose up -d
   
   cd ../redis
   docker-compose up -d
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

The project follows a modular structure:

```
src/
├── commands/       # CLI commands
├── config/         # Configuration files
├── controllers/    # Request handlers
├── models/         # Data models
├── repository/     # Data access layer
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── app.js          # Application entry point
```

## Coding Standards

### Style Guide

- Follow the ESLint configuration in the project
- Use camelCase for variables and functions
- Use PascalCase for classes
- Use UPPER_CASE for constants
- Use descriptive names for variables and functions

### Code Organization

- Keep files focused on a single responsibility
- Group related functionality in directories
- Use index.js files to export public APIs
- Keep functions small and focused

### Documentation

- Document all public APIs with JSDoc comments
- Include parameter and return type information
- Provide examples for complex functions
- Update Swagger documentation for API changes

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- src/services/__tests__/userService.test.js
```

### Writing Tests

- Place tests in `__tests__` directories near the code being tested
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies
- Test both success and failure cases

## Git Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Commit Messages

Follow the conventional commits format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or modifying tests
- `chore`: Changes to the build process or tools

### Pull Requests

- Create a pull request for each feature or bug fix
- Include a clear description of the changes
- Reference any related issues
- Ensure all tests pass
- Request code review from at least one team member

## Debugging

### Local Debugging

- Use `console.log()` for quick debugging
- For more advanced debugging, use Node.js debugger:
  ```bash
  node --inspect-brk src/app.js
  ```
- Connect with Chrome DevTools or VS Code debugger

### Logging

- Use the logger utility for application logging
- Log levels: error, warn, info, debug
- Include relevant context in log messages
- Avoid logging sensitive information

## API Documentation

The API is documented using Swagger:

- Swagger UI is available at `/api-docs`
- Update the Swagger documentation when adding or modifying endpoints
- Include request and response examples

## Performance Considerations

- Use pagination for list endpoints
- Implement caching for frequently accessed data
- Use indexes for database queries
- Monitor memory usage and response times
- Optimize database queries

## Security Best Practices

- Validate all user input
- Use parameterized queries to prevent injection attacks
- Implement rate limiting for public endpoints
- Keep dependencies up to date
- Follow the principle of least privilege
- Use HTTPS in production
- Sanitize error messages sent to clients