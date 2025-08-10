import userService from "@/services/user.service.js";
import friendRequestService from "@/services/friend-request.service.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse, sendApiResponse } from "@/utils/api-response.js";
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
  HttpException,
} from "@/utils/app-error.js";
import { asyncHandler } from "@/middlewares/asynchandler.middleware.js";
import { HTTPSTATUS } from "@/config/http.config.js";
import { Types } from "mongoose";

const userController = {
  getRecommendedUsers: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }
      const currentUserId = req.user.id;
      const currentUser = req.user;

      const friendIds: Types.ObjectId[] = currentUser.friends.map((friend) =>
        friend instanceof Types.ObjectId ? friend : friend._id
      );
      const recommendedUsers = await userService.getRecommendedUsers(
        currentUserId,
        friendIds
      );

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          data: recommendedUsers,
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),

  getMyFriends: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }

      const user = await userService.getUserFriends(req.user.id);

      if (!user) {
        throw new NotFoundException("User not found!");
      }

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          data: user,
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),

  sendFriendRequest: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }
      const myId = req.user.id;
      const { id: recipientId } = req.params;

      // prevent sending req to yourself
      if (myId === recipientId) {
        throw new BadRequestException(
          "You can't send friend request to yourself"
        );
      }

      const recipient = await userService.findUserById(recipientId);
      if (!recipient) {
        throw new NotFoundException("Recipient not found");
      }

      // check if user is already friends
      if (recipient.friends.includes(myId)) {
        throw new BadRequestException("You are already friends with this user");
      }

      // check if a req already exists
      const existingRequest = await friendRequestService.findExistingRequest(
        myId,
        recipientId
      );

      if (existingRequest) {
        throw new BadRequestException(
          "A friend request already exists between you and this user"
        );
      }

      const friendRequest = await friendRequestService.createFriendRequest(
        myId,
        recipientId
      );

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          data: friendRequest,
          statusCode: HTTPSTATUS.CREATED,
        })
      );
    }
  ),

  acceptFriendRequest: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { id: requestId } = req.params;

      const friendRequest = await friendRequestService.findRequestById(
        requestId
      );

      if (!friendRequest) {
        throw new NotFoundException("Friend request not found");
      }

      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }

      // Verify the current user is the recipient
      if (friendRequest.recipient.toString() !== req.user.id) {
        throw new HttpException(
          "You are not authorized to accept this request",
          403
        );
      }

      friendRequest.status = "accepted";
      await friendRequest.save();

      // add each user to the other's friends array
      // $addToSet: adds elements to an array only if they do not already exist.
      await userService.addFriendToUser(
        friendRequest.sender.toString(),
        friendRequest.recipient.toString()
      );

      await userService.addFriendToUser(
        friendRequest.recipient.toString(),
        friendRequest.sender.toString()
      );

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          message: "Friend request accepted",
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),

  getFriendRequests: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }

      const incomingReqs =
        await friendRequestService.getIncomingPendingRequests(req.user.id);

      const acceptedReqs =
        await friendRequestService.getAcceptedOutgoingRequests(req.user.id);

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          data: { incomingReqs, acceptedReqs },
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),

  getOutgoingFriendReqs: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }

      const outgoingRequests =
        await friendRequestService.getOutgoingPendingRequests(req.user.id);

      return sendApiResponse(
        res,
        new ApiResponse({
          success: true,
          data: outgoingRequests,
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),
};

export default userController;
