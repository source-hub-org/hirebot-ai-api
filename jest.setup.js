// jest.setup.js
const dotenv = require('dotenv');

// Load environment variables from .env.testing file
beforeAll(() => {
  dotenv.config({ path: '.env.testing' });
});
