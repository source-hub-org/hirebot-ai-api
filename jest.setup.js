// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.testing file
beforeAll(() => {
  // Use absolute path to ensure the file is found
  const envPath = path.resolve(process.cwd(), '.env.testing');
  const result = dotenv.config({ path: envPath });

  if (result.error) {
    console.error('Error loading .env.testing file:', result.error);
  } else {
    console.log('.env.testing file loaded successfully');
    console.log('DB_NAME:', process.env.DB_NAME);
  }
});
