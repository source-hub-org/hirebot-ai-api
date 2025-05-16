# Deployment Guide

This guide provides instructions for deploying the HireBot AI API in various environments.

## Deployment Options

HireBot AI API supports several deployment options:

1. **Docker Compose**: Recommended for most deployments
2. **Manual Deployment**: For custom server setups
3. **Cloud Deployment**: For AWS, Google Cloud, or Azure

## Docker Compose Deployment

### Prerequisites

- Docker and Docker Compose installed
- Git for cloning the repository

### Deployment Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/thangtran3112/hirebot-ai-api.git
   cd hirebot-ai-api
   ```

2. Create a `.env` file based on `.env.example`:

   ```
   APP_PORT=8000
   PORT=3000
   MONGODB_URI=mongodb://mongodb:27017
   DB_NAME=hirebot_db
   JWT_SECRET=your_secure_secret

   SWAGGER_URL=https://your-domain.com

   # Redis Configuration
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_PASSWORD=your_redis_password
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

3. Start all services:

   ```bash
   docker-compose up -d
   ```

4. Verify the deployment:

   ```bash
   # Check if containers are running
   docker-compose ps

   # Check application logs
   docker-compose logs -f app
   ```

5. Access the API at `http://your-server-ip:8000` or your configured domain.

### Scaling with Docker Compose

To scale the application:

```bash
# Scale to 3 API instances
docker-compose up -d --scale app=3
```

## Manual Deployment

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6.16.0 or higher)
- Redis
- Nginx (recommended for production)

### Deployment Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/thangtran3112/hirebot-ai-api.git
   cd hirebot-ai-api
   ```

2. Install dependencies:

   ```bash
   npm install --production
   ```

3. Create a `.env` file with your production settings.

4. Build the application:

   ```bash
   npm run build
   ```

5. Start the application:

   ```bash
   # Using PM2 (recommended)
   pm2 start ecosystem.config.js --env production

   # Or using Node.js directly
   NODE_ENV=production node dist/app.js
   ```

6. Configure Nginx as a reverse proxy:

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. Set up SSL with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

## Cloud Deployment

### AWS Deployment

1. **EC2 Instance**:

   - Launch an EC2 instance with Amazon Linux 2
   - Install Docker and Docker Compose
   - Follow the Docker Compose deployment steps

2. **ECS (Elastic Container Service)**:

   - Create a task definition using the Docker images
   - Create an ECS cluster
   - Deploy the task as a service
   - Set up an Application Load Balancer

3. **Using AWS Fargate**:
   - Create a task definition
   - Configure Fargate launch type
   - Set up service auto-scaling

### Google Cloud Platform

1. **Compute Engine**:

   - Create a VM instance
   - Install Docker and Docker Compose
   - Follow the Docker Compose deployment steps

2. **Google Kubernetes Engine (GKE)**:

   - Create Kubernetes deployment files
   - Deploy to GKE cluster
   - Set up Cloud Load Balancing

3. **Cloud Run**:
   - Build and push Docker image to Container Registry
   - Deploy to Cloud Run
   - Configure environment variables

### Azure

1. **Virtual Machine**:

   - Create an Azure VM
   - Install Docker and Docker Compose
   - Follow the Docker Compose deployment steps

2. **Azure Kubernetes Service (AKS)**:

   - Create Kubernetes deployment files
   - Deploy to AKS cluster
   - Set up Azure Load Balancer

3. **Azure App Service**:
   - Create an App Service plan
   - Deploy using container registry
   - Configure environment variables

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions

Example workflow file (`.github/workflows/deploy.yml`):

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build Docker image
        run: docker build -t hirebot-api .

      - name: Push to Docker Registry
        uses: docker/build-push-action@v2
        with:
          push: true
          tags: your-registry/hirebot-api:latest

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /path/to/deployment
            docker-compose pull
            docker-compose up -d
```

## Monitoring and Maintenance

### Monitoring

1. **Application Monitoring**:

   - Use PM2 for process monitoring
   - Implement health check endpoints
   - Set up logging with Winston or similar

2. **Server Monitoring**:

   - Use Prometheus for metrics collection
   - Set up Grafana for visualization
   - Configure alerts for critical metrics

3. **Log Management**:
   - Centralize logs with ELK Stack or similar
   - Set up log rotation
   - Configure log levels appropriately

### Backup Strategy

1. **Database Backups**:

   - Schedule regular MongoDB backups
   - Store backups in a secure location
   - Test restoration procedures

2. **Configuration Backups**:
   - Back up environment files
   - Store Docker Compose configurations
   - Document custom settings

### Updating the Application

1. **Rolling Updates**:

   ```bash
   # Pull latest changes
   git pull

   # Update dependencies
   npm install

   # Restart the application
   pm2 restart all
   ```

2. **Docker Updates**:

   ```bash
   # Pull latest images
   docker-compose pull

   # Update containers
   docker-compose up -d
   ```

## Security Considerations

1. **Network Security**:

   - Use a firewall to restrict access
   - Implement rate limiting
   - Use HTTPS for all connections

2. **Application Security**:

   - Keep dependencies up to date
   - Implement proper authentication and authorization
   - Validate all user inputs

3. **Server Security**:
   - Apply security updates regularly
   - Use minimal permissions
   - Implement intrusion detection
