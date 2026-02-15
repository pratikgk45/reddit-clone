/**
 * Test file for Apollo Client configuration
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NEXT_PUBLIC_APPSYNC_URL: 'https://test-api.appsync-api.us-east-1.amazonaws.com/graphql',
    NEXT_PUBLIC_APPSYNC_API_KEY: 'test-api-key',
    NODE_ENV: 'test',
  };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('Apollo Client', () => {
  it('should create Apollo Client instance', () => {
    const client = require('@/lib/apollo-client').default;
    expect(client).toBeDefined();
    expect(client.link).toBeDefined();
    expect(client.cache).toBeDefined();
  });

  it('should have correct configuration', () => {
    const client = require('@/lib/apollo-client').default;

    // Check default options
    expect(client.defaultOptions).toBeDefined();
    expect(client.defaultOptions.watchQuery).toBeDefined();
    expect(client.defaultOptions.query).toBeDefined();
    expect(client.defaultOptions.mutate).toBeDefined();
  });

  it('should handle missing API key gracefully', () => {
    delete process.env.NEXT_PUBLIC_APPSYNC_API_KEY;
    jest.resetModules();

    // Should not throw, but log warning
    expect(() => {
      require('@/lib/apollo-client');
    }).not.toThrow();
  });
});
