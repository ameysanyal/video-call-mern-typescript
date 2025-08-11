// This test suite covers both the constructor behavior of the ApiResponse class and the correct functionality of the sendApiResponse helper,
// which is tested using mock objects to simulate the Express Response.
import { describe, it, expect, vi } from 'vitest';
import { ApiResponse, sendApiResponse } from '../../../src/utils/api-response.js';
import { HTTPSTATUS } from '../../../src/config/http.config.js';

describe('ApiResponse', () => {
  // Test case for default values
  it('should initialize with default values when no arguments are provided', () => {
    const response = new ApiResponse({});
    expect(response.success).toBe(true);
    expect(response.statusCode).toBe(HTTPSTATUS.OK);
    expect(response.message).toBe('Execution Successful.');
    expect(response.data).toBe(null);
    expect(response.meta).toBe(null);
    expect(response.language).toBeUndefined();
  });

  // Test case for custom values
  it('should initialize with provided custom values', () => {
    const testData = { id: 1, name: 'Test Item' };
    const testMeta = { total: 1 };
    const testMessage = 'Custom success message';
    const testLanguage = 'en';

    const response = new ApiResponse({
      success: false,
      statusCode: HTTPSTATUS.CREATED,
      data: testData,
      meta: testMeta,
      message: testMessage,
      language: testLanguage,
    });

    expect(response.success).toBe(false);
    expect(response.statusCode).toBe(HTTPSTATUS.CREATED);
    expect(response.message).toBe(testMessage);
    expect(response.data).toEqual(testData);
    expect(response.meta).toEqual(testMeta);
    expect(response.language).toBe(testLanguage);
  });

  // Test case for mixed values (some custom, some default)
  it('should use a mix of custom and default values correctly', () => {
    const testData = { id: 2, name: 'Another Item' };
    const response = new ApiResponse({
      data: testData,
      statusCode: HTTPSTATUS.BAD_REQUEST,
    });

    expect(response.success).toBe(true); // Should be default
    expect(response.statusCode).toBe(HTTPSTATUS.BAD_REQUEST); // Should be custom
    expect(response.message).toBe('Execution Successful.'); // Should be default
    expect(response.data).toEqual(testData); // Should be custom
    expect(response.meta).toBe(null); // Should be default
  });
});

// A helper function to create a mock Express response object
const createMockResponse = () => {
  const res = {
    status: vi.fn(() => res), // The status function should return the res object
    json: vi.fn(() => res), // The json function should also return the res object
  };
  return res;
};

describe('sendApiResponse', () => {
  it('should correctly set the status code and send the JSON response', () => {
    // Arrange: Create a mock Express response object
    const mockRes = createMockResponse();

    // Arrange: Create a sample ApiResponse object
    const apiResponse = new ApiResponse({
      success: true,
      statusCode: HTTPSTATUS.OK,
      message: 'Test message',
      data: { key: 'value' },
    });

    // Act: Call the function with the mock objects
    const result = sendApiResponse(mockRes as any, apiResponse);

    // Assert: Verify that the status and json methods were called correctly
    expect(mockRes.status).toHaveBeenCalledWith(HTTPSTATUS.OK);
    expect(mockRes.status().json).toHaveBeenCalledWith(apiResponse);
    expect(result).toBe(mockRes);
  });
});
