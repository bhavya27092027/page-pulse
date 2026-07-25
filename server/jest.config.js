/** Jest config. Maps `.js` import specifiers to `.ts` for ts-jest CJS resolution. */
/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      { tsconfig: { target: 'ES2022', module: 'CommonJS', esModuleInterop: true, moduleResolution: 'Node' } },
    ],
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/index.ts',
    '!src/tests/**',
  ],
  coverageDirectory: 'coverage',
};
