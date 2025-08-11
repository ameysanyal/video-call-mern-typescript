// This setup file uses mongodb-memory-server to create a temporary, in-memory MongoDB instance for your Vitest tests.
// Its purpose is to provide a clean, isolated database for each test run, ensuring your tests are reliable
// and don't interfere with each other or a real database.
vi.mock('../src/config/logger.js');
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';
import { appLogger } from '../src/config/logger.js';

let mongo: any;

//It creates a mock in-memory MongoDB server.
beforeAll(async () => {
  console.error = vi.fn();
  console.log = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri);

  //By adding this mock, the errorHandler will still execute and attempt to log the error, but the mocked error function will do nothing,
  // keeping your test output clean and allowing you to see the true assertion failures.
  vi.spyOn(appLogger, 'error').mockImplementation(() => {});
  vi.spyOn(appLogger, 'info').mockImplementation(() => {});
  vi.spyOn(appLogger, 'warn').mockImplementation(() => {});
  vi.spyOn(appLogger, 'debug').mockImplementation(() => {});
});

// Note = console mocking: The beforeAll block also mocks console.error, console.log, etc. This prevents console output
// from your application (like logs from your database connection) from cluttering your test results.

//It clears the database by deleting all data from every collection.
beforeEach(async () => {
  const collections = await mongoose.connection?.db?.collections();

  if (!collections) return;
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

//It stops the in-memory MongoDB server and closes the Mongoose connection.
afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});
