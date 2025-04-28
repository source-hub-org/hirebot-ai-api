module.exports = {
  apps: [
    {
      name: 'hirebot-ai-api',
      script: 'src/server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        MONGODB_URI: 'mongodb://mongodb:27017',
        DB_NAME: 'hirebot_db',
        REDIS_HOST: 'redis',
        REDIS_PORT: 6379,
        JOB_POLLING_INTERVAL: 5000
      }
    }
  ]
};