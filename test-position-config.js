/**
 * Test script for position configuration
 *
 * This script tests that the position configuration is correctly loaded from environment variables
 */

// Import the position utilities
const { getPositionMetadata } = require('./src/utils/positionUtils');

// Test function
async function testPositionConfig() {
  console.log('Testing position configuration...');

  // Test each position
  for (const position of ['intern', 'fresher', 'junior', 'middle', 'senior', 'expert']) {
    console.log(`\nTesting position: ${position}`);

    try {
      const metadata = await getPositionMetadata(position);
      console.log('Difficulty Text:', metadata.difficultyText);
      console.log('Position Instruction:', metadata.positionInstruction);
      console.log('Position Level:', metadata.positionLevel);
    } catch (error) {
      console.error(`Error testing position ${position}:`, error);
    }
  }

  console.log('\nTest completed.');
}

// Run the test
testPositionConfig().catch(console.error);
