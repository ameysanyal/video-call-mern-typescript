// getEnv is utility for safely accessing environment variables

// Usage of This function:
// Avoids runtime bugs by making sure required environment variables are actually set.
// Lets you define sensible defaults.
// Improves error visibility during development and deployment.

export const getEnv = (key: string, defaultValue?: string): string => {

  //fetch environment variable using key and store it in value
  const value = process.env[key];

  //if the value is not set, return defaultValue if provided
  if (value === undefined) {

    // if defaultValue of environment variable is also not provided, throw error
    if (defaultValue === undefined) {
      throw new Error(`Environment variable ${key} is not set`);
    }
    return defaultValue;
  }
  //If the environment variable was found, return its value.
  return value;
};
