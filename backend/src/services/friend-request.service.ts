import FriendRequest, { FriendRequestDocument } from '@/models/friend-request.model.js'; // Adjust path if necessary
import { Logger, winstonLogger } from '@/config/logger.js'; // Assuming your logger setup
import { Types } from 'mongoose'; // For Mongoose ObjectId types, if needed for typing parameters

// Define an interface for clarity and type safety
export interface IFriendRequestService {
  // Corresponds to: const existingRequest = await FriendRequest.findOne(...)
  findExistingRequest(
    senderId: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<FriendRequestDocument | null>;

  // Corresponds to: const friendRequest = await FriendRequest.create(...)
  createFriendRequest(
    senderId: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<FriendRequestDocument>;

  // Corresponds to: const friendRequest = await FriendRequest.findById(requestId);
  findRequestById(requestId: string | Types.ObjectId): Promise<FriendRequestDocument | null>;

  // Corresponds to: const incomingReqs = await FriendRequest.find(...) (for recipient, pending)
  getIncomingPendingRequests(userId: string | Types.ObjectId): Promise<FriendRequestDocument[]>;

  // Corresponds to: const acceptedReqs = await FriendRequest.find(...) (for sender, accepted)
  getAcceptedOutgoingRequests(userId: string | Types.ObjectId): Promise<FriendRequestDocument[]>;

  // Corresponds to: const outgoingRequests = await FriendRequest.find(...) (for sender, pending)
  getOutgoingPendingRequests(userId: string | Types.ObjectId): Promise<FriendRequestDocument[]>;

  // Method for updating status, used in acceptFriendRequest
  updateRequestStatus(
    requestId: string | Types.ObjectId,
    status: 'accepted' | 'pending' | 'rejected'
  ): Promise<FriendRequestDocument | null>;
}

export class FriendRequestService implements IFriendRequestService {
  private friendRequestModel: typeof FriendRequest; // Mongoose Model Type
  private logger: Logger;

  constructor(friendRequestModel: typeof FriendRequest, logger: Logger) {
    this.friendRequestModel = friendRequestModel;
    this.logger = logger;
  }

  /**
   * Finds an existing friend request between two users, regardless of sender/recipient.
   * Corresponds to your existingRequest logic.
   */
  async findExistingRequest(
    senderId: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<FriendRequestDocument | null> {
    this.logger.debug(
      `Checking for existing friend request between ${senderId} and ${recipientId}`
    );

    try {
      return await this.friendRequestModel.findOne({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId },
        ],
      });
    } catch (error) {
      this.logger.error(
        `Error finding existing friend request between ${senderId} and ${recipientId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Creates a new pending friend request.
   * Corresponds to your friendRequest = await FriendRequest.create(...) logic.
   */
  async createFriendRequest(
    senderId: string | Types.ObjectId,
    recipientId: string | Types.ObjectId
  ): Promise<FriendRequestDocument> {
    this.logger.info(`Creating new friend request from ${senderId} to ${recipientId}`);
    try {
      return await this.friendRequestModel.create({
        sender: senderId,
        recipient: recipientId,
        status: 'pending', // Default status
      });
    } catch (error) {
      this.logger.error(`Error creating friend request from ${senderId} to ${recipientId}:`, error);
      throw error;
    }
  }

  /**
   * Finds a friend request document by its ID.
   * Corresponds to your friendRequest = await FriendRequest.findById(requestId) logic.
   */
  async findRequestById(requestId: string | Types.ObjectId): Promise<FriendRequestDocument | null> {
    this.logger.debug(`Finding friend request by ID: ${requestId}`);
    try {
      return await this.friendRequestModel.findById(requestId);
    } catch (error) {
      this.logger.error(`Error finding friend request by ID ${requestId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all pending friend requests where the given user is the recipient (incoming requests).
   * Corresponds to your incomingReqs logic.
   */
  async getIncomingPendingRequests(
    userId: string | Types.ObjectId
  ): Promise<FriendRequestDocument[]> {
    this.logger.debug(`Fetching incoming pending friend requests for user ${userId}`);
    try {
      return await this.friendRequestModel
        .find({
          recipient: userId,
          status: 'pending',
        })
        .populate('sender', 'fullName profilePic nativeLanguage learningLanguage');
    } catch (error) {
      this.logger.error(`Error fetching incoming pending requests for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all accepted friend requests where the given user is the sender (outgoing accepted requests).
   * Corresponds to your acceptedReqs logic.
   */
  async getAcceptedOutgoingRequests(
    userId: string | Types.ObjectId
  ): Promise<FriendRequestDocument[]> {
    this.logger.debug(`Fetching accepted outgoing friend requests from user ${userId}`);
    try {
      return await this.friendRequestModel
        .find({
          sender: userId,
          status: 'accepted',
        })
        .populate('recipient', 'fullName profilePic'); // Populate only relevant fields for accepted display
    } catch (error) {
      this.logger.error(`Error fetching accepted outgoing requests from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all pending friend requests where the given user is the sender (outgoing pending requests).
   * Corresponds to your outgoingRequests logic.
   */
  async getOutgoingPendingRequests(
    userId: string | Types.ObjectId
  ): Promise<FriendRequestDocument[]> {
    this.logger.debug(`Fetching outgoing pending friend requests from user ${userId}`);
    try {
      return await this.friendRequestModel
        .find({
          sender: userId,
          status: 'pending',
        })
        .populate('recipient', 'fullName profilePic nativeLanguage learningLanguage');
    } catch (error) {
      this.logger.error(`Error fetching outgoing pending requests from user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Updates the status of a specific friend request.
   * This is a utility method used by your `acceptFriendRequest` controller logic.
   */
  async updateRequestStatus(
    requestId: string | Types.ObjectId,
    status: 'accepted' | 'pending' | 'rejected'
  ): Promise<FriendRequestDocument | null> {
    this.logger.info(`Updating status of friend request ${requestId} to ${status}`);
    try {
      const friendRequest = await this.friendRequestModel.findById(requestId);
      if (!friendRequest) {
        this.logger.warn(`Friend request with ID ${requestId} not found for status update.`);
        return null;
      }
      friendRequest.status = status;
      await friendRequest.save();
      return friendRequest;
    } catch (error) {
      this.logger.error(`Error updating status for friend request ${requestId}:`, error);
      throw error;
    }
  }
}

export default new FriendRequestService(FriendRequest, new Logger(winstonLogger));
