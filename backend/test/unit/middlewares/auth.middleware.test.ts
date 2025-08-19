import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../../../src/models/user.model.js';
import { protectRoute } from '../../../src/middlewares/auth.middleware.js';

vi.mock('jsonwebtoken');
vi.mock('../../../src/models/user.model.js');
// Mocks the jsonwebtoken and User modules. This is crucial for unit testing, as it replaces the real module with a mock,
// preventing the test from making real database or external API calls.

describe('protectRoute middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let next: NextFunction;

  //This hook runs before each it test block.
  // It resets the mocks to a clean state to ensure tests are isolated and don't affect each other.
  beforeEach(() => {
    mockReq = {
      cookies: {},
      user: undefined,
    } as Request;

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as Partial<Response>;

    next = vi.fn();

    //Resets the call history of all mock functions.
    vi.clearAllMocks();
  });

  it('should return 401 if no token is provided', async () => {
    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorized - No token provided',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if token is valid but no userId in payload', async () => {
    mockReq.cookies = { jwt: 'valid.token' };

    // Mocks the jwt.verify function to return an empty object, simulating a token without a user ID.
    vi.mocked(jwt.verify).mockReturnValue({} as any);

    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorized - Invalid token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if userId is not a valid ObjectId', async () => {
    mockReq.cookies = { jwt: 'valid.token' };

    vi.mocked(jwt.verify).mockReturnValue({ userId: 'not-an-objectid' } as any);
    vi.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorized - Invalid user ID',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 if user not found', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    mockReq.cookies = { jwt: 'valid.token' };

    vi.mocked(jwt.verify).mockReturnValue({ userId: validId } as any);
    vi.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    } as any);

    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Unauthorized - User not found',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should attach user to request and call next if valid', async () => {
    const validId = new mongoose.Types.ObjectId().toString();
    mockReq.cookies = { jwt: 'valid.token' };

    const fakeUser = { _id: validId, name: 'Test User' };

    vi.mocked(jwt.verify).mockReturnValue({ userId: validId } as any);
    vi.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);

    //Mocks the database call
    vi.mocked(User.findById).mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    } as any);

    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(User.findById).toHaveBeenCalledWith(validId);
    expect(next).toHaveBeenCalled();
    expect(mockReq.user).toEqual(fakeUser);
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should return 500 if jwt.verify throws an error', async () => {
    mockReq.cookies = { jwt: 'valid.token' };

    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await protectRoute(mockReq as Request, mockRes as Response, next);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: 'Internal Server Error',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
