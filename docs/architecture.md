# Architecture

This document provides an overview of the HireBot AI API architecture, explaining the system design, components, and their interactions.

## System Architecture

HireBot AI API follows a modular, layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Applications                     │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                         API Gateway                          │
│                         (Nginx)                              │
└───────────────────────────────┬─────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────┐
│                       Express.js Server                      │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│   Routes    │ Controllers │ Middleware  │    Validation    │
└─────────────┴──────┬──────┴─────────────┴──────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                     Service Layer                           │
├────────────┬────────────┬────────────────┬────────────────┤
│ User       │ Question   │ Candidate      │ Instrument     │
│ Service    │ Service    │ Service        │ Service        │
└────────────┴────────────┴────────────────┴────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                   Repository Layer                          │
└────────────────────┬───────────────────────────────────────┘
                     │
┌────────────────────▼───────────────────────────────────────┐
│                     Data Layer                              │
├────────────────────┬──────────────────┬───────────────────┤
│      MongoDB       │      Redis       │    File System    │
└────────────────────┴──────────────────┴───────────────────┘
```

## Key Components

### 1. API Gateway (Nginx)

- Handles SSL termination
- Load balancing
- Request routing
- Rate limiting
- Static file serving

### 2. Express.js Server

- **Routes**: Define API endpoints and HTTP methods
- **Controllers**: Handle request processing and response formatting
- **Middleware**: Implement cross-cutting concerns (authentication, logging, etc.)
- **Validation**: Ensure request data meets requirements

### 3. Service Layer

- Implements business logic
- Orchestrates operations across multiple repositories
- Handles complex workflows
- Manages transactions

Key services:
- **User Service**: User management and authentication
- **Question Service**: Question generation and management
- **Candidate Service**: Candidate profile management
- **Instrument Service**: Assessment instrument management

### 4. Repository Layer

- Abstracts data access operations
- Implements CRUD operations
- Handles data filtering, sorting, and pagination
- Manages database connections

### 5. Data Layer

- **MongoDB**: Primary data store for structured data
- **Redis**: Caching and job queue management
- **File System**: Storage for temporary files and exports

## External Integrations

### Google Gemini AI

- Integration for AI-powered question generation
- Communicates via REST API
- Handles rate limiting and retries

### OAuth2 Authentication

- Supports multiple authentication flows
- Manages access tokens and refresh tokens
- Handles client registration and authorization

## Asynchronous Processing

The system uses a job queue for asynchronous processing:

1. **Job Creation**: API endpoints create jobs for long-running tasks
2. **Queue Management**: Redis stores and manages the job queue
3. **Worker Processing**: Background workers process jobs from the queue
4. **Status Updates**: Jobs update their status as they progress
5. **Result Notification**: Clients can poll for job completion

## Data Flow

### Question Generation Flow

```
1. Client requests question generation
2. API validates request and creates a job
3. Job is added to the Redis queue
4. Worker picks up the job
5. Worker constructs AI prompt
6. Prompt is sent to Gemini AI
7. Response is processed and validated
8. Questions are stored in MongoDB
9. Job status is updated
10. Client retrieves generated questions
```

### Authentication Flow

```
1. Client requests access token
2. API validates credentials
3. Token is generated and stored
4. Token is returned to client
5. Client includes token in subsequent requests
6. API validates token for each request
7. Access is granted or denied based on token validity
```

## Scalability Considerations

- **Horizontal Scaling**: Multiple API instances behind load balancer
- **Database Sharding**: MongoDB sharding for large datasets
- **Caching Strategy**: Redis caching for frequently accessed data
- **Worker Pool**: Multiple workers for parallel job processing
- **Microservices**: Potential future migration to microservices architecture

## Security Architecture

- **Authentication**: OAuth2 with JWT tokens
- **Authorization**: Role-based access control
- **Data Encryption**: TLS for data in transit
- **Input Validation**: Comprehensive validation for all inputs
- **Rate Limiting**: Protection against abuse
- **Audit Logging**: Tracking of security-relevant events