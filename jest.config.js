// Sync object
const config = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.js$': 'babel-jest',
    /*'^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],*/
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    '<rootDir>\/node_modules\/(?!airdcpp-apisocket)\/'
  ],
  roots: [
    '<rootDir>/src/'
  ],
  // extensionsToTreatAsEsm: ['.ts'],
  testEnvironment: 'node',
  moduleFileExtensions: [
    'js',
    'ts',
    'json'
  ],
  //moduleNameMapper: {
  //  '(src/.*)$': '<rootDir>/$1'
  //},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // '#(.*)': '<rootDir>/node_modules/$1',
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
