FROM node:22
# Install PM2 globally
RUN npm install pm2 -g

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Expose the application port
EXPOSE 3000

# Start the application with PM2
CMD ["pm2-runtime", "ecosystem.config.js"]