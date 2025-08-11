import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorHandler } from '../../../src/middlewares/errorHandler.middleware.js';
import { Response, Request, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../src/utils/app-error.js';
import { HTTPSTATUS } from '../../../src/config/http.config.js';
import { ErrorCodeEnum } from '../../../src/enums/error-code.enum.js';

describe('errorHandler middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockReq = {
      path: '/test/path',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockNext = vi.fn();

    vi.clearAllMocks();
  });

  it('should handle ZodError and return 400 with formatted errors', () => {
    // Create a sample ZodIssue array to simulate a ZodError
    const issues = [
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['body', 'name'],
        message: 'Expected string, received number',
      },
      {
        code: 'too_small',
        minimum: 1,
        type: 'string',
        inclusive: true,
        path: ['body', 'age'],
        message: 'String must contain at least 1 character(s)',
      },
    ];
    const zodError = new ZodError(issues as any);

    errorHandler(zodError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTPSTATUS.BAD_REQUEST);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Validation failed',
      errors: [
        { field: 'body.name', message: 'Expected string, received number' },
        {
          field: 'body.age',
          message: 'String must contain at least 1 character(s)',
        },
      ],
      errorCode: ErrorCodeEnum.VALIDATION_ERROR,
    });
  });

  it('should handle AppError and return custom status and message', () => {
    const appError = new AppError('Custom error message', HTTPSTATUS.FORBIDDEN, 'CUSTOM_ERROR');

    errorHandler(appError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTPSTATUS.FORBIDDEN);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Custom error message',
      errorCode: 'CUSTOM_ERROR',
    });
  });

  it('should handle generic error and return 500 with message', () => {
    const genericError = new Error('Something went wrong');

    errorHandler(genericError, mockReq as Request, mockRes as Response, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(HTTPSTATUS.INTERNAL_SERVER_ERROR);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
      error: 'Something went wrong',
    });
  });

  it('should log error and path', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const error = new Error('Test error');

    errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error occurred on PATH:',
      mockReq.path,
      'Error:',
      error
    );

    consoleSpy.mockRestore();
  });
});
