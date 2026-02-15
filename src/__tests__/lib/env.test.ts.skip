/**
 * Example test file for environment validation
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock process.env
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Environment Validation', () => {
  it('should validate required environment variables', () => {
    process.env.NEXTAUTH_URL = 'http://localhost:3000';
    process.env.NEXTAUTH_SECRET = 'test-secret-min-32-chars-long-for-validation';

    // This will throw if validation fails
    expect(() => {
      require('@/lib/env');
    }).not.toThrow();
  });

  it('should throw error for missing required variables', () => {
    delete process.env.NEXTAUTH_URL;
    delete process.env.NEXTAUTH_SECRET;

    expect(() => {
      require('@/lib/env');
    }).toThrow();
  });
});
