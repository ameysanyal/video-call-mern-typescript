import { describe, it, expect } from 'vitest';
import {
  AppError,
  HttpException,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerException,
} from '../../../src/utils/app-error.js';
import { HTTPSTATUS } from '../../../src/config/http.config.js';
import { ErrorCodeEnum } from '../../../src/enums/error-code.enum.js';

describe('AppError', () => {
  it('should create an instance with a default status code and no error code', () => {
    const error = new AppError('Test message');
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test message');
    expect(error.statusCode).toBe(HTTPSTATUS.INTERNAL_SERVER_ERROR);
    expect(error.errorCode).toBeUndefined();
    expect(error.stack).toBeDefined();
  });

  it('should create an instance with a custom status code and error code', () => {
    const error = new AppError(
      'Custom message',
      HTTPSTATUS.BAD_REQUEST,
      ErrorCodeEnum.VALIDATION_ERROR
    );
    expect(error.message).toBe('Custom message');
    expect(error.statusCode).toBe(HTTPSTATUS.BAD_REQUEST);
    expect(error.errorCode).toBe(ErrorCodeEnum.VALIDATION_ERROR);
  });
});

// --- Test suite for specialized error classes ---

describe('HttpException', () => {
  it('should set the default message but require a custom status code', () => {
    const error = new HttpException(undefined, HTTPSTATUS.BAD_REQUEST);
    expect(error).toBeInstanceOf(HttpException);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe('Http Exception Error');
    expect(error.statusCode).toBe(HTTPSTATUS.BAD_REQUEST);
    expect(error.errorCode).toBeUndefined();
  });

  it('should set a custom message and custom error code', () => {
    const error = new HttpException(
      'Custom HTTP error',
      HTTPSTATUS.UNAUTHORIZED,
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
    expect(error.message).toBe('Custom HTTP error');
    expect(error.statusCode).toBe(HTTPSTATUS.UNAUTHORIZED);
    expect(error.errorCode).toBe(ErrorCodeEnum.ACCESS_UNAUTHORIZED);
  });
});

// --- Test suite for NotFoundException ---

describe('NotFoundException', () => {
  it('should have a default message, status code 404, and resource not found error code', () => {
    const error = new NotFoundException();
    expect(error).toBeInstanceOf(NotFoundException);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(HTTPSTATUS.NOT_FOUND);
    expect(error.errorCode).toBe(ErrorCodeEnum.RESOURCE_NOT_FOUND);
  });

  it('should accept a custom message while retaining default status and error codes', () => {
    const error = new NotFoundException('User profile not found');
    expect(error.message).toBe('User profile not found');
    expect(error.statusCode).toBe(HTTPSTATUS.NOT_FOUND);
    expect(error.errorCode).toBe(ErrorCodeEnum.RESOURCE_NOT_FOUND);
  });
});

// --- Test suite for BadRequestException ---

describe('BadRequestException', () => {
  it('should have a default message, status code 400, and validation error code', () => {
    const error = new BadRequestException();
    expect(error).toBeInstanceOf(BadRequestException);
    expect(error.message).toBe('Bad Request');
    expect(error.statusCode).toBe(HTTPSTATUS.BAD_REQUEST);
    expect(error.errorCode).toBe(ErrorCodeEnum.VALIDATION_ERROR);
  });

  it('should accept a custom message and custom error code', () => {
    const error = new BadRequestException('Invalid email format', ErrorCodeEnum.INVALID_INPUT);
    expect(error.message).toBe('Invalid email format');
    expect(error.statusCode).toBe(HTTPSTATUS.BAD_REQUEST);
    expect(error.errorCode).toBe(ErrorCodeEnum.INVALID_INPUT);
  });
});

// --- Test suite for UnauthorizedException ---

describe('UnauthorizedException', () => {
  it('should have a default message, status code 401, and unauthorized access error code', () => {
    const error = new UnauthorizedException();
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(error.message).toBe('Unauthorized Access');
    expect(error.statusCode).toBe(HTTPSTATUS.UNAUTHORIZED);
    expect(error.errorCode).toBe(ErrorCodeEnum.ACCESS_UNAUTHORIZED);
  });

  it('should accept a custom message', () => {
    const error = new UnauthorizedException('Authentication failed');
    expect(error.message).toBe('Authentication failed');
    expect(error.statusCode).toBe(HTTPSTATUS.UNAUTHORIZED);
    expect(error.errorCode).toBe(ErrorCodeEnum.ACCESS_UNAUTHORIZED);
  });
});

// --- Test suite for InternalServerException ---

describe('InternalServerException', () => {
  it('should have a default message, status code 500, and internal server error code', () => {
    const error = new InternalServerException();
    expect(error).toBeInstanceOf(InternalServerException);
    expect(error.message).toBe('Internal Server Error');
    expect(error.statusCode).toBe(HTTPSTATUS.INTERNAL_SERVER_ERROR);
    expect(error.errorCode).toBe(ErrorCodeEnum.INTERNAL_SERVER_ERROR);
  });

  it('should accept a custom message', () => {
    const error = new InternalServerException('Database connection failed');
    expect(error.message).toBe('Database connection failed');
    expect(error.statusCode).toBe(HTTPSTATUS.INTERNAL_SERVER_ERROR);
    expect(error.errorCode).toBe(ErrorCodeEnum.INTERNAL_SERVER_ERROR);
  });
});
