// jest.config.js
module.exports = {
  setupFilesAfterEnv: ['./jest.setup.js'],
  collectCoverage: true,
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  moduleNameMapper: {
    '^@repository/(.*)$': '<rootDir>/src/repository/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@service/(.*)$': '<rootDir>/src/services/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
  collectCoverageFrom: ['src/**/*.js', '!src/index.js', '!**/node_modules/**', '!**/vendor/**'],
  coverageDirectory: 'coverage',
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
};
