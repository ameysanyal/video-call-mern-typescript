// Usage of this code
// To make status code readable - HTTPSTATUS.NOT_FOUND is clearer than 404.
// Centralized - Easier to maintain and update in one place.
//  Type-safe - Prevents typos or use of invalid status codes.
// Reusable	- Can be shared across services/modules (API, frontend, etc).

// httpConfig is a function that returns an object with named types for each http status code.
const httpConfig = () => ({
  // Success responses
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  // Client error responses
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server error responses
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
});

// Immediately calls httpConfig() and exports the resulting object.
export const HTTPSTATUS = httpConfig();

//Define a type called HttpStatusCodeType that can only be one of the values from the HTTPSTATUS object.
export type HttpStatusCodeType = (typeof HTTPSTATUS)[keyof typeof HTTPSTATUS];

//typeof HTTPSTATUS - This gets the type of the object — not its value.
// becomes:
// {
//   OK: number;
//   CREATED: number;
//   NOT_FOUND: number;
//   INTERNAL_SERVER_ERROR: number;
// }

// keyof typeof HTTPSTATUS - This gets all the keys of the object as a union of string literals.
// becomes:
// "OK" | "CREATED" | "NOT_FOUND" | "INTERNAL_SERVER_ERROR"

// (typeof HTTPSTATUS)["OK" | "CREATED" | ...]
// // becomes:
// 200 | 201 | 404 | 500

// Note = why function is used instead of directly exporting an object?
// Why use a function here?
// Reason	Benefit
// 🧠 Lazy initialization	In complex apps, returning from a function lets you delay object creation until needed.
// 🧩 Reusable instances	You could call httpConfig() multiple times to create independent copies (if mutable or contextual).
// 🔁 Future extensibility	Easier to add logic later — e.g., load codes based on environment, language, or config.
// 🔒 Immutability enforcement	You could freeze the object inside the function to make it read-only.
// 🧪 Testability	Functions are easier to mock/override in unit tests than constants.
