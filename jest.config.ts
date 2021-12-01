import type { Config } from '@jest/types'

const { defaults: tsjPreset } = require('ts-jest/presets')

export default async (): Promise<Config.InitialOptions> => {
  return {
    testEnvironment: 'node',
    preset: '@shelf/jest-mongodb',
    roots: ['<rootDir>/src/'],
    testTimeout: 120000,
    watchPathIgnorePatterns: [
      'globalConfig',
      '/node_modules/',
      'jest.config.ts',
      'jest-mongodb.config.ts',
    ],
    setupFiles: ['dotenv/config', '<rootDir>/jest.setup.ts'],
    testMatch: [
      '**/__tests__/**/*.+(ts|tsx|js)',
      '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    moduleNameMapper: {
      '@helpers/(.*)': '<rootDir>/src/helpers/$1',
      '@services/(.*)': '<rootDir>/src/services/$1',
      '@interfaces/(.*)': '<rootDir>/src/interfaces/$1',
      '@db/(.*)': '<rootDir>/src/db/$1',
      '@websites/(.*)': '<rootDir>/src/websites/$1',
      '@cronjobs/(.*)': '<rootDir>/src/cronjobs/$1',
      '@slack-service/(.*)': '<rootDir>/src/slack-service/$1',
    },
    transform: tsjPreset.transform,
  }
}
