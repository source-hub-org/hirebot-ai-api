# Common Commands

This document lists the most frequently used CLI commands for managing the HireBot AI API.

## Data Initialization Commands

### Initialize Topics

Load topics from a JSON file:

```bash
npm run command app:init-topics ./tmp/topics.json
```

### Initialize Positions

Load positions from a JSON file:

```bash
npm run command app:init-positions ./tmp/positions.json
```

### Initialize Languages

Load languages from a JSON file:

```bash
npm run command app:init-languages ./tmp/languages.json
```

## Question Generation Commands

### Generate Questions

Generate questions for specific topics, positions, and languages:

```bash
npm run generate-questions -- --topics javascript,react --positions frontend-developer --languages en --count 10
```

### List Questions

List all questions in the database:

```bash
npm run command questions:list
```

### Export Questions

Export questions to a JSON file:

```bash
npm run command questions:export ./exports/questions.json
```

## User Management Commands

### Create User

Create a new user:

```bash
npm run command users:create --email admin@example.com --username admin --password securepassword
```

### List Users

List all users:

```bash
npm run command users:list
```

## Database Management Commands

### Backup Database

Create a backup of the MongoDB database:

```bash
npm run command db:backup ./backups/
```

### Restore Database

Restore a database from backup:

```bash
npm run command db:restore ./backups/hirebot_db_20230515.gz
```

## System Commands

### Check Health

Check the health of the system:

```bash
npm run command system:health-check
```

### Clear Cache

Clear the Redis cache:

```bash
npm run command system:clear-cache
```

## Development Commands

### Run Tests

Run all tests:

```bash
npm test
```

### Run Linter

Check code style:

```bash
npm run lint
```

### Build for Production

Build the application for production:

```bash
npm run build
```
