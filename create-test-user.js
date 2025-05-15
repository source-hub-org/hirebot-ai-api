/**
 * Script to create a test user for OAuth authentication
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME,
    });
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Create a test user
async function createTestUser() {
  try {
    // Since we're using a simple in-memory user store in oauthUserService.js,
    // we don't need to create an actual user in the database.
    // The service is configured to accept username 'test' with password 'password'

    console.log('Test user is already configured in the oauthUserService.js');
    console.log('Username: test');
    console.log('Password: password');

    // Create a test OAuth client if it doesn't exist
    const OAuthClient = mongoose.model(
      'oauth_client',
      new mongoose.Schema(
        {
          clientId: { type: String, required: true, unique: true },
          clientSecret: { type: String, required: true },
          redirectUris: { type: [String], required: true },
          grants: { type: [String], required: true },
          createdAt: { type: Date, default: Date.now },
          updatedAt: { type: Date, default: Date.now },
        },
        {
          timestamps: true,
          collection: 'oauth_client',
        }
      )
    );

    // Check if client already exists
    const existingClient = await OAuthClient.findOne({
      clientId: process.env.OAUTH_DEFAULT_CLIENT_ID || 'test-client',
    });

    if (existingClient) {
      console.log('OAuth client already exists:');
      console.log(`Client ID: ${existingClient.clientId}`);
      console.log(`Client Secret: ${existingClient.clientSecret}`);
      console.log(`Redirect URIs: ${existingClient.redirectUris.join(', ')}`);
      console.log(`Grants: ${existingClient.grants.join(', ')}`);
    } else {
      // Create a new client
      const clientId = process.env.OAUTH_DEFAULT_CLIENT_ID || 'test-client';
      const clientSecret = process.env.OAUTH_DEFAULT_CLIENT_SECRET || 'test-secret';
      const redirectUri =
        process.env.OAUTH_DEFAULT_REDIRECT_URI || 'http://localhost:3000/oauth/callback';

      const newClient = new OAuthClient({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUris: [redirectUri],
        grants: ['password', 'refresh_token', 'authorization_code'],
      });

      await newClient.save();

      console.log('Created new OAuth client:');
      console.log(`Client ID: ${clientId}`);
      console.log(`Client Secret: ${clientSecret}`);
      console.log(`Redirect URI: ${redirectUri}`);
      console.log(`Grants: password, refresh_token, authorization_code`);
    }

    console.log('\nTo get an access token, use:');
    console.log('curl -X POST http://localhost:3000/api/oauth/token \\');
    console.log('  -H "Content-Type: application/x-www-form-urlencoded" \\');
    console.log(
      '  -d "grant_type=password&client_id=test-client&client_secret=test-secret&username=test&password=password"'
    );

    return true;
  } catch (error) {
    console.error('Error creating test user:', error);
    return false;
  }
}

// Main function
async function main() {
  const connected = await connectToMongoDB();
  if (!connected) {
    process.exit(1);
  }

  const created = await createTestUser();
  if (!created) {
    process.exit(1);
  }

  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');

  process.exit(0);
}

// Run the script
main();
