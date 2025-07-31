import User, { UserDocument } from '../models/user.model.js';
import { Logger, winstonLogger } from '../config/logger.js'; // Example dependency for DI
import { Types } from "mongoose";

// Define an interface for the service for better type checking and DI
export interface IUserService {
  getRecommendedUsers(currentUserId: string | Types.ObjectId, currentUserFriends: Types.ObjectId[]): Promise<UserDocument[]>;
  getUserFriends(userId: string | Types.ObjectId): Promise<UserDocument[] | null>;
  findUserById(userId: string | Types.ObjectId): Promise<UserDocument | null>;
  addFriendToUser(userId: string | Types.ObjectId, friendId: string): Promise<UserDocument | null>;
  findUserByEmail(email: string): Promise<UserDocument | null>;
  createUser(userData: { email: string; fullName: string; password?: string; profilePic: string; isOnboarded?: boolean }): Promise<UserDocument>;
  updateUserById(userId: string | Types.ObjectId, updates: any): Promise<UserDocument | null>;
}

export class UserService implements IUserService {
  private userModel: typeof User; // Correct type for Mongoose model
  private logger: Logger;

  constructor(userModel: typeof User, logger: Logger) { // Dependencies injected
    this.userModel = userModel;
    this.logger = logger;
  }

   /**
   * Fetches recommended users for a given user.
   * Excludes the current user and their existing friends.
   */
  async getRecommendedUsers(currentUserId: string | Types.ObjectId, currentUserFriends: Types.ObjectId[]): Promise<UserDocument[]> {
    this.logger.debug(`Fetching recommended users for ${currentUserId}`);
    try {
      const recommendedUsers = await this.userModel.find({
        $and: [
          { _id: { $ne: currentUserId } }, // exclude current user
          { _id: { $nin: currentUserFriends } }, // exclude current user's friends
          { isOnboarded: true }, // Only show onboarded users
        ],
      });
      this.logger.debug(`Found ${recommendedUsers.length} recommended users.`);
      return recommendedUsers;
    } catch (error) {
      this.logger.error(`Error fetching recommended users for ${currentUserId}:`, error);
      throw error; // Re-throw to be caught by asyncHandler
    }
  }

  /**
   * Fetches the friends of a specific user.
   */
  async getUserFriends(userId: string | Types.ObjectId): Promise<UserDocument[] | null> {
    this.logger.debug(`Fetching friends for user ${userId}`);
    try {
      const user = await this.userModel.findById(userId)
        .select("friends")
        .populate(
          "friends",
          "fullName profilePic nativeLanguage learningLanguage"
        ) as (UserDocument & { friends: UserDocument[] }) | null; // Cast for populated friends

      return user ? user.friends : null;
    } catch (error) {
      this.logger.error(`Error fetching friends for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Finds a user by their ID.
   */
  async findUserById(userId: string | Types.ObjectId): Promise<UserDocument | null> {
    this.logger.debug(`Finding user by ID: ${userId}`);
    try {
      return await this.userModel.findById(userId);
    } catch (error) {
      this.logger.error(`Error finding user by ID ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Adds a friend ID to a user's friends array.
   */
  async addFriendToUser(userId: string | Types.ObjectId, friendId: string): Promise<UserDocument | null> {
    this.logger.debug(`Adding friend ${friendId} to user ${userId}`);
    try {
      return await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { friends: friendId } }, // $addToSet ensures no duplicates
        { new: true } // Return the updated document
      );
    } catch (error) {
      this.logger.error(`Error adding friend ${friendId} to user ${userId}:`, error);
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    this.logger.debug(`Attempting to find user by email: ${email}`);
    try {
      return await this.userModel.findOne({ email });
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  async createUser(userData: { email: string; fullName: string; password?: string; profilePic: string; isOnboarded?: boolean }): Promise<UserDocument> {
    this.logger.info(`Creating new user with email: ${userData.email}`);
    try {
      // If password hashing isn't handled by a Mongoose pre-save hook,
      // it should be done in the controller before calling this service,
      // or implement it here if this service is responsible for all user creation logic.
      const newUser = await this.userModel.create(userData);
      this.logger.debug(`New user created with ID: ${newUser._id}`);
      return newUser;
    } catch (error) {
      this.logger.error(`Error creating user with email ${userData.email}:`, error);
      throw error;
    }
  }

  async updateUserById(userId: string | Types.ObjectId, updates: any): Promise<UserDocument | null> {
    this.logger.debug(`Updating user with ID: ${userId}`);
    try {
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        updates, // Pass updates directly
        { new: true } // Return the updated document
      );
      if (updatedUser) {
        this.logger.debug(`User ${userId} updated successfully.`);
      } else {
        this.logger.warn(`User with ID ${userId} not found for update.`);
      }
      return updatedUser;
    } catch (error) {
      this.logger.error(`Error updating user with ID ${userId}:`, error);
      throw error;
    }
  }

}

// Option A: Export an instance (simple approach for smaller apps)
export default new UserService(User, new Logger(winstonLogger));

// Option B: Export the class and instantiate in a central place (e.g., a DI container)
// export default UserService;