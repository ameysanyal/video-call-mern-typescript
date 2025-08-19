import { describe, it, expect, vi } from 'vitest';
import { asyncHandler } from '../../../src/middlewares/asynchandler.middleware.js';
import { Request, Response } from 'express';

describe('asyncHandler', () => {
  const mockReq = {} as Request;
  const mockRes = {} as Response;

  it('should call the controller function', async () => {
    //Creates a mock function called controller that simulates a controller that succeeds without returning a value.
    // The .mockResolvedValue(undefined) ensures it resolves without an error.
    const controller = vi.fn().mockResolvedValue(undefined);

    //mock function for the next middleware
    const next = vi.fn();

    const wrapped = asyncHandler(controller);
    await wrapped(mockReq, mockRes, next);

    expect(controller).toHaveBeenCalledWith(mockReq, mockRes, next);

    //Confirms that next was not called with an error, as no error was thrown.
    expect(next).not.toHaveBeenCalledWith(expect.any(Error));
  });

  it('should pass errors to next()', async () => {
    const error = new Error('Test error');
    const controller = vi.fn().mockRejectedValue(error);
    const next = vi.fn();

    const wrapped = asyncHandler(controller);
    await wrapped(mockReq, mockRes, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

// Ensures that asyncHandler properly calls the controller.
// Ensures that errors thrown by the controller are passed to next().
// Works for any Express controller, making your error handling logic testable and predictable.
