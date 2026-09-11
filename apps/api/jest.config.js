module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts', '**/*.e2e-spec.ts'],
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleNameMapper: {
    '^@app/api/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 70,
    },
  },
};