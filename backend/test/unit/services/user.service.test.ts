//This test file verifies the behavior of the UserService class, which encapsulates database operations related to users.
// Instead of hitting a real MongoDB database, it mocks the Mongoose model methods (findById, findByIdAndUpdate, find)
// so the tests run fast and deterministically.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserService } from '../../../src/services/user.service.js';
import { Logger } from '../../../src/config/logger.js';
import { Types } from 'mongoose';

//mockUserModel simulates the MongoDB model methods.
//mockLogger simulates the logging utility so we don’t log to console during tests.
const mockUserModel = {
  findById: vi.fn(),
  findByIdAndUpdate: vi.fn(),
  find: vi.fn(),
};

const mockLogger = {
  debug: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
} as unknown as Logger;

// Create a fresh instance for each test
let userService: UserService;

//vi.clearAllMocks() resets mock call history before each test.
//Each test gets a new UserService instance to avoid state leaks between tests.
beforeEach(() => {
  vi.clearAllMocks();
  userService = new UserService(mockUserModel as any, mockLogger);
});

//Each describe block corresponds to a single method of UserService.
describe('UserService', () => {
  describe('findUserById', () => {
    it('should return a user when found', async () => {
      //Arrange: Fake user is returned when findById is called.
      const fakeUser = { _id: '123', fullName: 'Test User' };
      mockUserModel.findById.mockResolvedValueOnce(fakeUser);

      //Act: Call the service method.
      const result = await userService.findUserById('123');

      //Assert
      //The service returns the fake user.
      expect(result).toEqual(fakeUser);

      //The database call was made with the correct ID.
      expect(mockUserModel.findById).toHaveBeenCalledWith('123');
    });

    //Tests the error-handling path.
    //Verifies that the logger is called with the correct message.
    it('should log and throw error if findById fails', async () => {
      const error = new Error('DB error');
      mockUserModel.findById.mockRejectedValueOnce(error);

      await expect(userService.findUserById('123')).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith('Error finding user by ID 123:', error);
    });
  });

  //Tests that addFriendToUser:
  //Calls findByIdAndUpdate with the correct MongoDB update operator $addToSet.
  //Returns the updated user.
  describe('addFriendToUser', () => {
    it('should call findByIdAndUpdate with $addToSet', async () => {
      const updatedUser = { _id: '123', friends: ['456'] };
      mockUserModel.findByIdAndUpdate.mockResolvedValueOnce(updatedUser);

      const result = await userService.addFriendToUser('123', '456');

      expect(mockUserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        { $addToSet: { friends: '456' } },
        { new: true }
      );
      expect(result).toEqual(updatedUser);
    });
  });

  //Ensures query filtering works:
  //Excludes current user ($ne).
  //Excludes friend IDs ($nin).
  //Filters for isOnboarded = true.
  describe('getRecommendedUsers', () => {
    it('should exclude current user and friends and return results', async () => {
      const currentUserId = new Types.ObjectId();
      const friendIds = [new Types.ObjectId()];
      const fakeUsers = [{ _id: 'abc', fullName: 'User A' }];

      mockUserModel.find.mockResolvedValueOnce(fakeUsers);

      const result = await userService.getRecommendedUsers(currentUserId, friendIds);

      expect(mockUserModel.find).toHaveBeenCalledWith({
        $and: [
          { _id: { $ne: currentUserId } },
          { _id: { $nin: friendIds } },
          { isOnboarded: true },
        ],
      });

      expect(result).toEqual(fakeUsers);
    });
  });
});

// If you’re separating unit tests (testing service logic in isolation) from integration tests
// (testing database interactions), you might reserve mongodb-memory-server for integration tests
// and mock dependencies for unit tests.
