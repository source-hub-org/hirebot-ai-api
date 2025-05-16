# Installation Guide

This guide provides detailed instructions for setting up and configuring the HireBot AI API.

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.16.0 or higher)
- Redis (for job queue management)
- Google Gemini API key

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/thangtran3112/hirebot-ai-api.git
cd hirebot-ai-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory based on the `.env.example` file:

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

### 4. Getting a Gemini API Key

To use the Google Gemini AI features, you'll need to obtain an API key:

1. Visit [Google AI Studio API Keys](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click on "Create API key"
4. Give your key a name (e.g., "HireBot AI")
5. Copy the generated API key
6. Add it to your `.env` file as `GEMINI_API_KEY=your_api_key_here`

### 5. Start the Services

#### Using Docker Compose (Recommended)

Start all services using Docker Compose:

```bash
# Start all services (MongoDB, Redis, Node.js app, and Nginx)
docker-compose up -d
```

#### Starting Individual Services

Start MongoDB:

```bash
cd docker/mongodb
docker-compose up -d
```

Start Redis:

```bash
cd ../redis
docker-compose up -d
```

### 6. Start the Application

For production:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Verifying Installation

Once the application is running, you can verify the installation by:

1. Accessing the Swagger documentation at `http://localhost:8000/api-docs`
2. Checking the health endpoint at `http://localhost:8000/api/health-check`

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running and accessible
   - Check the MongoDB connection string in your `.env` file

2. **Redis Connection Error**
   - Verify Redis is running
   - Check Redis host, port, and password in your `.env` file

3. **Gemini API Key Issues**
   - Ensure your Gemini API key is valid
   - Check for any rate limiting or quota issues

For more detailed troubleshooting, refer to the logs:

```bash
# View application logs
docker logs hirebot-api

# View MongoDB logs
docker logs mongodb

# View Redis logs
docker logs redis
```