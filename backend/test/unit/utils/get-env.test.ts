import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv } from '../../../src/utils/get-env.js';

describe('getEnv', () => {
  // Store the original process.env to restore it later
  const originalEnv = process.env;

  // Set up a clean environment before each test
  beforeEach(() => {
    // A fresh copy of the environment for each test
    process.env = { ...originalEnv };
  });

  // Restore the original environment after each test
  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return the environment variable value when it is set', () => {
    // GIVEN an environment variable is set
    process.env.TEST_KEY = 'test_value';

    // WHEN getEnv is called with that key
    const value = getEnv('TEST_KEY');

    // THEN it should return the set value
    expect(value).toBe('test_value');
  });

  it('should return the default value when the environment variable is not set', () => {
    // GIVEN an environment variable is not set
    delete process.env.TEST_KEY;

    // WHEN getEnv is called with a default value
    const value = getEnv('TEST_KEY', 'default_value');

    // THEN it should return the provided default value
    expect(value).toBe('default_value');
  });

  it('should return the environment variable value even if a default is provided', () => {
    // GIVEN an environment variable is set
    process.env.TEST_KEY = 'actual_value';

    // WHEN getEnv is called with a default value
    const value = getEnv('TEST_KEY', 'ignored_default');

    // THEN it should prioritize the environment variable's value
    expect(value).toBe('actual_value');
  });

  it('should throw an error when the variable is not set and no default is provided', () => {
    // GIVEN an environment variable is not set
    delete process.env.TEST_KEY;

    // WHEN getEnv is called without a default value
    // THEN it should throw an error with the correct message
    expect(() => getEnv('TEST_KEY')).toThrow('Environment variable TEST_KEY is not set');
  });
});
