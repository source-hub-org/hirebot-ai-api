const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server };
