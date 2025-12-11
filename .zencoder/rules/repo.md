---
description: Repository Information Overview
alwaysApply: true
---

# HireBot AI API Information

## Summary

HireBot AI API is a Node.js-based backend service for managing AI-powered technical interview quizzes. It generates, stores, and manages interview questions using Google's Gemini AI, supporting OAuth2 authentication, comprehensive candidate management, and assessment instruments. The system is containerized with Docker and deployable with PM2.

## Structure

```
hirebot-ai-api/
├── src/                    # Application source code
│   ├── index.js           # Main app initialization
│   ├── server.js          # Server entry point (for PM2)
│   ├── cli.js             # CLI commands
│   ├── controllers/       # Route controllers
│   ├── routes/            # Route definitions
│   ├── services/          # Business logic (jobs, Redis, OAuth)
│   ├── models/            # Mongoose schemas
│   ├── repository/        # Data access layer
│   ├── middlewares/       # Express middlewares (auth, etc.)
│   ├── config/            # Configuration (Swagger, etc.)
│   ├── utils/             # Utility functions
│   ├── commands/          # CLI commands
│   ├── oauth/             # OAuth implementation
│   └── scripts/           # Database scripts
├── test/                  # Test suites (120+ test files)
├── docker/                # Docker configurations
│   ├── mongodb/
│   └── redis/
├── docs/                  # Project documentation
├── ecosystem.config.js    # PM2 configuration
├── docker-compose.yml     # Multi-service container setup
├── Dockerfile             # Docker image build
├── jest.config.js         # Jest test configuration
├── eslint.config.js       # ESLint linting rules
└── .env.example           # Environment configuration template
```

## Language & Runtime

**Language**: JavaScript (Node.js)  
**Runtime Version**: Node.js v22  
**Build System**: npm  
**Package Manager**: npm (also supports yarn/bun)  
**Process Manager**: PM2

## Dependencies

**Main Dependencies**:
- **express** (v5.1.0) - REST API framework
- **mongoose** (v8.14.0) - MongoDB ODM
- **mongodb** (v6.16.0) - MongoDB driver
- **ioredis** (v5.6.1) - Redis client
- **express-oauth-server** (v2.0.0) - OAuth2 server
- **bcrypt** (v6.0.0) - Password hashing
- **dotenv** (v16.5.0) - Environment variable management
- **winston** (v3.17.0) - Logging
- **swagger-jsdoc** (v6.2.8), **swagger-ui-express** (v5.0.1) - API documentation

**Development Dependencies**:
- **jest** (v29.7.0) - Testing framework
- **supertest** (v7.1.0) - HTTP assertion library
- **chai** (v5.2.0), **chai-http** (v5.1.1) - Test assertions
- **eslint** (v9.25.1) - Code linting
- **prettier** (v3.5.3) - Code formatting
- **nodemon** (v3.1.9) - Auto-restart during development
- **ioredis-mock** (v8.9.0) - Redis testing mock
- **mongodb-memory-server** (v10.1.4) - In-memory MongoDB for tests

## Build & Installation

**Installation**:
```bash
npm install
```

**Development Server**:
```bash
npm run dev
```

**Production Start**:
```bash
npm start
```

**Linting & Formatting**:
```bash
npm run lint          # Check code style
npm run lint:fix      # Auto-fix linting issues
npm run format        # Format code with Prettier
```

**CLI Commands**:
```bash
npm run command       # Run CLI utilities
```

## Docker

**Dockerfile**: Multi-stage Node.js v22 image with PM2  
**Base Image**: `node:22`  
**Working Directory**: `/app`  
**Port**: 3000 (internal), 8000 (via Nginx proxy)

**Services** (docker-compose.yml):
- **nodejs_app**: Main API server (built from Dockerfile)
- **mongodb**: MongoDB database (latest image)
- **redis**: Redis cache (latest image)
- **nginx**: Reverse proxy and load balancer

**Key Configuration**:
- Environment variables loaded from `.env` file
- Volume mounts for code and node_modules
- Internal network communication (hirebot_network)
- Persistent volumes for MongoDB and Redis data
- PM2 runtime for process management

## Testing

**Framework**: Jest (v29.7.0)  
**Test Location**: `test/` directory (mirrors `src/` structure)  
**Naming Convention**: `*.test.js`  
**Test Environment**: node  
**Coverage**: Enabled by default (reports: json, lcov, text, clover, html)

**Test Configuration** (jest.config.js):
- Path aliases for imports (@repository, @routes, @utils, @service, @config)
- Test file pattern: `**/test/**/*.test.js`
- Coverage directory: `coverage/`
- Setup file: `jest.setup.js`

**Run Tests**:
```bash
npm test                    # Run tests (no coverage report)
npm run test:coverage       # Run tests with coverage report
npm run test:coverage:report # Run tests and open coverage in browser
```

**Test Categories** (120+ tests):
- Controllers (logic questions, submissions, instrument tags, etc.)
- Routes and API endpoints
- Services and business logic
- Repositories and data access
- Middlewares and validators
- Utilities and helpers
- Migrations and database operations
- Configuration and setup

**Testing Environment**: Uses `.env.testing` file with in-memory MongoDB and Redis mocks for isolated test execution.

## Configuration Files

**Environment Configuration**:
- `.env` - Main environment variables (create from `.env.example`)
- `.env.no-docker.example` - Non-containerized setup template
- `.env.testing` - Testing-specific configuration

**Key Environment Variables**:
- `PORT=3000` - Application port
- `MONGODB_URI=mongodb://mongodb:27017` - MongoDB connection
- `DB_NAME=hirebot_db` - Database name
- `REDIS_HOST=redis` - Redis host
- `REDIS_PORT=6379` - Redis port
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `GEMINI_MODEL=gemini-2.0-flash` - AI model selection
- `JWT_SECRET` - JWT authentication secret
- `NODE_ENV` - Environment (development/production/testing)

**API Entry Point**: `src/server.js` → calls `src/index.js` for initialization

## Project Architecture

The application follows a **layered architecture**:
1. **Routes** - Express route handlers
2. **Controllers** - Request handlers and business logic orchestration
3. **Services** - Core business logic (job processing, Redis, OAuth, etc.)
4. **Repository** - Database access layer (MongoDB queries)
5. **Models** - Mongoose schemas and data models

**Key Features**:
- OAuth2 authentication and user management
- AI-powered question generation via Gemini API
- Job processing and queue management with Redis
- Candidate and submission management
- Skill assessment instruments
- Swagger API documentation
- Comprehensive error logging with Winston
