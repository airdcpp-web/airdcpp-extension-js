// Sync object
const config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.ts$': 'ts-jest'
  },
  transformIgnorePatterns: [
    '<rootDir>\/node_modules\/'
  ],
  roots: [
    '<rootDir>/src/'
  ],
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  /*transformIgnorePatterns: [
    '<rootDir>\/node_modules\/(?!chalk)\/'
  ],*/
  moduleNameMapper: {
    '(src/.*)$': '<rootDir>/$1'
  },
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: [
    '/dist/',
    '/node_modules/',
    '/src/tests/'
  ],
  collectCoverage: true,
};

//module.exports = config;
export default config;
