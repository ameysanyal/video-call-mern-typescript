import { HTTPSTATUS, HttpStatusCodeType } from "../config/http.config.js";
import { ErrorCodeEnum, ErrorCodeEnumType } from "../enums/error-code.enum.js";

// HTTPSTATUS: An object with standard HTTP status codes (like 200, 400, 404, 500).

// HttpStatusCodeType: A type that restricts values to valid HTTP status codes.

// ErrorCodeEnum: A list of custom error codes.

// ErrorCodeEnumType: A type that only allows keys of ErrorCodeEnum.


//This creates a custom base error class named AppError, extending the built-in Error class in JavaScript.
export class AppError extends Error {
  public statusCode: HttpStatusCodeType;
  public errorCode?: ErrorCodeEnumType;

  constructor(
    message: string,
    statusCode = HTTPSTATUS.INTERNAL_SERVER_ERROR,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;

    //Captures a clean stack trace pointing to where the error originated (useful for debugging).
    Error.captureStackTrace(this, this.constructor);
  }
}

//A specific type of AppError for general HTTP exceptions.
//Sets a default message but requires statusCode. Passes everything to AppError.
export class HttpException extends AppError {
  constructor(
    message = "Http Exception Error",
    statusCode: HttpStatusCodeType,
    errorCode?: ErrorCodeEnumType
  ) {
    super(message, statusCode, errorCode);
  }
}

//Handles 404 Not Found errors.
export class NotFoundException extends AppError {
  constructor(message = "Resource not found", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.NOT_FOUND,
      errorCode || ErrorCodeEnum.RESOURCE_NOT_FOUND
    );
  }
}

//For 400 Bad Request errors.
// Defaults to the message "Bad Request" and error code VALIDATION_ERROR.
export class BadRequestException extends AppError {
  constructor(message = "Bad Request", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.BAD_REQUEST,
      errorCode || ErrorCodeEnum.VALIDATION_ERROR
    );
  }
}

//For 401 Unauthorized errors.
export class UnauthorizedException extends AppError {
  constructor(message = "Unauthorized Access", errorCode?: ErrorCodeEnumType) {
    super(
      message,
      HTTPSTATUS.UNAUTHORIZED,
      errorCode || ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }
}

//Handles server-side (500) errors.
export class InternalServerException extends AppError {
  constructor(
    message = "Internal Server Error",
    errorCode?: ErrorCodeEnumType
  ) {
    super(
      message,
      HTTPSTATUS.INTERNAL_SERVER_ERROR,
      errorCode || ErrorCodeEnum.INTERNAL_SERVER_ERROR
    );
  }
}


// Situation	Recommendation
// New, modern project	✅ Prefer throw new CustomException(...)
// Legacy/middleware-heavy code	🟡 return next(new ApiError(...)) is fine
// Mixed approach?	⚠️ Possible, but avoid inconsistency for team readability