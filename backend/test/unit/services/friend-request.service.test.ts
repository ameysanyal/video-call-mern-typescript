import { describe, it, expect, vi, beforeEach } from "vitest";
import { Types } from "mongoose";
import FriendRequest from "../../../src/models/friend-request.model.js";
import { Logger } from "../../../src/config/logger.js";
import { FriendRequestService } from "../../../src/services/friend-request.service.js";

vi.mock("../../../src/models/friend-request.model.js");

describe("FriendRequestService", () => {
  let service: FriendRequestService;
  let mockLogger: Partial<Logger>;

  beforeEach(() => {
    // Minimal logger mock, just spies
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };

    service = new FriendRequestService(FriendRequest, mockLogger as Logger);
    vi.clearAllMocks();
  });

  const senderId = new Types.ObjectId();
  const recipientId = new Types.ObjectId();
  const requestId = new Types.ObjectId();

  describe("findExistingRequest", () => {
    it("should find existing friend request with correct query", async () => {
      const expectedDoc = { _id: requestId.toString() };
      vi.mocked(FriendRequest.findOne).mockResolvedValue(expectedDoc as any);

      const result = await service.findExistingRequest(senderId, recipientId);

      expect(FriendRequest.findOne).toHaveBeenCalledWith({
        $or: [
          { sender: senderId, recipient: recipientId },
          { sender: recipientId, recipient: senderId },
        ],
      });
      expect(result).toBe(expectedDoc);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("should throw and log error when findOne fails", async () => {
      const error = new Error("DB error");
      vi.mocked(FriendRequest.findOne).mockRejectedValue(error);

      await expect(
        service.findExistingRequest(senderId, recipientId)
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error finding existing friend request"),
        error
      );
    });
  });

  describe("createFriendRequest", () => {
    it("should create a friend request with status pending", async () => {
      const createdDoc = {
        sender: senderId,
        recipient: recipientId,
        status: "pending",
      };
      vi.mocked(FriendRequest.create).mockResolvedValue(createdDoc as any);

      const result = await service.createFriendRequest(senderId, recipientId);

      expect(FriendRequest.create).toHaveBeenCalledWith({
        sender: senderId,
        recipient: recipientId,
        status: "pending",
      });
      expect(result).toBe(createdDoc);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Creating new friend request from ${senderId} to ${recipientId}`
      );
    });

    it("should throw and log error when create fails", async () => {
      const error = new Error("DB create error");
      vi.mocked(FriendRequest.create).mockRejectedValue(error);

      await expect(
        service.createFriendRequest(senderId, recipientId)
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error creating friend request"),
        error
      );
    });
  });

  describe("findRequestById", () => {
    it("should find request by ID", async () => {
      const foundDoc = { _id: requestId.toString() };
      vi.mocked(FriendRequest.findById).mockResolvedValue(foundDoc as any);

      const result = await service.findRequestById(requestId);

      expect(FriendRequest.findById).toHaveBeenCalledWith(requestId);
      expect(result).toBe(foundDoc);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        `Finding friend request by ID: ${requestId}`
      );
    });

    it("should throw and log error on findById failure", async () => {
      const error = new Error("DB findById error");
      vi.mocked(FriendRequest.findById).mockRejectedValue(error);

      await expect(service.findRequestById(requestId)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error finding friend request by ID"),
        error
      );
    });
  });

  describe("getIncomingPendingRequests", () => {
    it("should find incoming pending requests and populate sender", async () => {
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(["req1", "req2"]),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      const results = await service.getIncomingPendingRequests(senderId);

      expect(FriendRequest.find).toHaveBeenCalledWith({
        recipient: senderId,
        status: "pending",
      });
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "sender",
        "fullName profilePic nativeLanguage learningLanguage"
      );
      expect(results).toEqual(["req1", "req2"]);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("should throw and log error on failure", async () => {
      const error = new Error("DB find error");
      const mockQuery = {
        populate: vi.fn().mockRejectedValue(error),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      await expect(
        service.getIncomingPendingRequests(senderId)
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching incoming pending requests"),
        error
      );
    });
  });

  describe("getAcceptedOutgoingRequests", () => {
    it("should find accepted outgoing requests and populate recipient", async () => {
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(["req1", "req2"]),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      const results = await service.getAcceptedOutgoingRequests(senderId);

      expect(FriendRequest.find).toHaveBeenCalledWith({
        sender: senderId,
        status: "accepted",
      });
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "recipient",
        "fullName profilePic"
      );
      expect(results).toEqual(["req1", "req2"]);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("should throw and log error on failure", async () => {
      const error = new Error("DB find error");
      const mockQuery = {
        populate: vi.fn().mockRejectedValue(error),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      await expect(
        service.getAcceptedOutgoingRequests(senderId)
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching accepted outgoing requests"),
        error
      );
    });
  });

  describe("getOutgoingPendingRequests", () => {
    it("should find outgoing pending requests and populate recipient", async () => {
      const mockQuery = {
        populate: vi.fn().mockResolvedValue(["req1", "req2"]),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      const results = await service.getOutgoingPendingRequests(senderId);

      expect(FriendRequest.find).toHaveBeenCalledWith({
        sender: senderId,
        status: "pending",
      });
      expect(mockQuery.populate).toHaveBeenCalledWith(
        "recipient",
        "fullName profilePic nativeLanguage learningLanguage"
      );
      expect(results).toEqual(["req1", "req2"]);
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it("should throw and log error on failure", async () => {
      const error = new Error("DB find error");
      const mockQuery = {
        populate: vi.fn().mockRejectedValue(error),
      };
      vi.mocked(FriendRequest.find).mockReturnValue(mockQuery as any);

      await expect(
        service.getOutgoingPendingRequests(senderId)
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error fetching outgoing pending requests"),
        error
      );
    });
  });

  describe("updateRequestStatus", () => {
    it("should update status and save friend request", async () => {
      const mockFriendRequest = {
        status: "pending",
        save: vi.fn().mockResolvedValue(true),
      };
      vi.mocked(FriendRequest.findById).mockResolvedValue(
        mockFriendRequest as any
      );

      const result = await service.updateRequestStatus(requestId, "accepted");

      expect(FriendRequest.findById).toHaveBeenCalledWith(requestId);
      expect(mockFriendRequest.status).toBe("accepted");
      expect(mockFriendRequest.save).toHaveBeenCalled();
      expect(result).toBe(mockFriendRequest);
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Updating status of friend request ${requestId} to accepted`
      );
    });

    it("should return null and warn if friend request not found", async () => {
      vi.mocked(FriendRequest.findById).mockResolvedValue(null);

      const result = await service.updateRequestStatus(requestId, "accepted");

      expect(FriendRequest.findById).toHaveBeenCalledWith(requestId);
      expect(result).toBeNull();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `Friend request with ID ${requestId} not found for status update.`
      );
    });

    it("should throw and log error on failure", async () => {
      const error = new Error("DB update error");
      vi.mocked(FriendRequest.findById).mockRejectedValue(error);

      await expect(
        service.updateRequestStatus(requestId, "accepted")
      ).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error updating status for friend request"),
        error
      );
    });
  });
});
