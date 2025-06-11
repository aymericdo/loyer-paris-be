import { defaults as tsjPreset } from 'ts-jest/presets'
import type { Config } from '@jest/types'

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
      '@api/(.*)': '<rootDir>/src/api/$1',
      '@cronjobs/(.*)': '<rootDir>/src/cronjobs/$1',
      '@db/(.*)': '<rootDir>/src/db/$1',
      '@interfaces/(.*)': '<rootDir>/src/interfaces/$1',
      '@messenger/(.*)': '<rootDir>/src/messenger/$1',
      '@services/(.*)': '<rootDir>/src/services/$1',
    },
    transform: tsjPreset.transform as unknown as { [regex: string]: string | Config.TransformerConfig },
  }
}
