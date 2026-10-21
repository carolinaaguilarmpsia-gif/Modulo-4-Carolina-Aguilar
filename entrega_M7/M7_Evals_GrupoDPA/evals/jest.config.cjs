/** Jest de las evals — config propia porque evals/ vive fuera de backend/ (rootDir de backend/tsconfig.json). */
module.exports = {
  rootDir: '..',
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  watchman: false,
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true, tsconfig: 'evals/tsconfig.json', diagnostics: { ignoreCodes: [151002] } }] },
  testMatch: ['**/evals/**/*.test.ts'],
  // entrega_M7/ es la copia del zip (dataset/ en vez de datos/): no es una suite del repo.
  testPathIgnorePatterns: ['/node_modules/', '/entrega_M7/'],
};
