// This code defines a constant ErrorCodeEnum containing standardized error codes and a TypeScript type ErrorCodeEnumType that restricts values to the exact keys of ErrorCodeEnum,
// ensuring type-safe usage of predefined error identifiers.

export const ErrorCodeEnum = {
  ACCESS_UNAUTHORIZED: "ACCESS_UNAUTHORIZED",
  MISSING_FIELDS: "MISSING_FIELDS",
  AUTH_USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  INVALID_INPUT: "INVALID_INPUT",
  AUTH_EMAIL_ALREADY_EXISTS: "AUTH_EMAIL_ALREADY_EXISTS",
  AUTH_INVALID_TOKEN: "AUTH_INVALID_TOKEN",
  EMAIL_EXISTS: "EMAIL_EXISTS",
  AUTH_NOT_FOUND: "AUTH_NOT_FOUND",
  AUTH_TOO_MANY_ATTEMPTS: "AUTH_TOO_MANY_ATTEMPTS",
  AUTH_UNAUTHORIZED_ACCESS: "AUTH_UNAUTHORIZED_ACCESS",
  AUTH_TOKEN_NOT_FOUND: "AUTH_TOKEN_NOT_FOUND",
  // Validation and Resource Errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND: "RESOURCE_NOT_FOUND",
  FILE_UPLOAD_ERROR: "FILE_UPLOAD_ERROR",

  // System Errors
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
} as const;

// as const is used to make it read-only, Attempting to modify it will result in a TypeScript error

export type ErrorCodeEnumType = keyof typeof ErrorCodeEnum;
