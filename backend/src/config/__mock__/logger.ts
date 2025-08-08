import { vi } from "vitest";
export const appLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
};

// Note = A __mocks__ folder should be created at the same level as the module you are mocking.
// This is a convention used by testing frameworks like Jest and Vitest for automatic mock handling.
//  When you call vi.mock('some-module'), the testing framework first looks
//  for a file named __mocks__/some-module.js to use as the mock.
