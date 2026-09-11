/** @type {import('jest').Config} */
module.exports = {
  displayName: 'architecture-tda',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../..',
  testMatch: [
    '<rootDir>/tests/architecture/**/*.test.ts',
  ],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        module: 'CommonJS',
        target: 'ES2022',
        strict: false,
        skipLibCheck: true,
        esModuleInterop: true,
        resolveJsonModule: true,
      },
    }],
  },
  // No coverage — TDA tests are architectural audits, not code coverage tools
  collectCoverage: false,
  verbose: true,
  forceExit: true,
};
