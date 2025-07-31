//This code defines a utility function to generate JWT access tokens in a secure and configurable way

import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { Env } from "../config/env.config.js";
import { Types } from "mongoose";

// JwtPayload: TypeScript type for decoded JWT payloads.
// SignOptions: TypeScript type for the options used when signing a token.

//Restricts time units for token expiry: seconds, minutes, hours, etc.
type TimeUnit = "s" | "m" | "h" | "d" | "w" | "y";

//Ensures expiresIn values like 15m, 7d are valid via template literal types.
type TimeString = `${number}${TimeUnit}`;

// Defines the shape of the payload that will be embedded in the JWT.
export type AccessTokenPayload = {
  userId: Types.ObjectId;
};

// Defines a custom type that includes:
// All SignOptions (standard JWT options like issuer, subject, etc.)
// Plus a required secret
// And optional expiresIn in formats like "15m" or 3600
type SignOptsAndSecret = SignOptions & {
  secret: string;
  expiresIn?: TimeString | number;
};

// Default JWT options. Here, the token is intended for "user" audience.
const defaults: SignOptions = {
  audience: ["user"],
};

//Loads default values from .env:
//JWT_EXPIRES_IN → e.g., "15m"
//JWT_SECRET_KEY → secret used to sign the token
const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_EXPIRES_IN as TimeString,
  secret: Env.JWT_SECRET_KEY,
};

//A reusable function to sign a JWT with provided payload and optional options.
export const signJwtToken = (
  payload: AccessTokenPayload,
  options?: SignOptsAndSecret
) => {

  //Checks if you're using default access token settings.
// If no options are passed, or passed value is the default access settings, it's considered an access token.
  const isAccessToken = !options || options === accessTokenSignOptions;

  //Destructures the secret and the rest of the signing options.
//Uses provided options, or falls back to accessTokenSignOptions.
  const { secret, ...opts } = options || accessTokenSignOptions;

//Generates a signed JWT using:
//payload (e.g., { userId: "123" })
//secret (used to encrypt/sign)
//combined options from defaults + user-provided or default opts
  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

//Decodes the token to get exp (expiry timestamp in seconds).
//Multiplies by 1000 to convert to milliseconds (JavaScript Date format).
//Only computed if this is an access token.

const expiresAt = isAccessToken
    ? (jwt.decode(token) as JwtPayload)?.exp! * 1000
    : undefined;

  //Returns the token string and its expiration time.
  return {
    token,
    expiresAt,
  };
};

// example usage const { token, expiresAt } = signJwtToken({ userId: "abc123" });
