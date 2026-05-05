module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'], // Tells Jest to look inside src/
  testMatch: ['**/tests/**/*.test.ts'], // Finds your tests inside src/tests/
  moduleFileExtensions: ['ts', 'js'],
  reporters: [
        "<rootDir>/src/tests/tools/jest-concise-reporter.js",
        "summary"
    ],
};