import bcrypt from 'bcrypt';

// Hashes a given string (e.g. a password).
export const hashValue = async (value: string, saltRounds: number = 10) =>
  await bcrypt.hash(value, saltRounds);

//Compares a plain string with a hashed string to check if they match.
export const compareValue = async (value: string, hashedValue: string) =>
  await bcrypt.compare(value, hashedValue);
