import { generateStreamToken } from "@/lib/streamChat.js";
import { Request, Response, NextFunction } from "express";
import { ApiResponse, sendApiResponse } from "@/utils/api-response.js";
import { UnauthorizedException } from "@/utils/app-error.js";
import { asyncHandler } from "@/middlewares/asynchandler.middleware.js";
import { HTTPSTATUS } from "@/config/http.config.js";

const chatController = {
  getStreamToken: asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user._id) {
        throw new UnauthorizedException(
          "Unauthorized: user not found in request"
        );
      }

      const token = generateStreamToken(req.user.id);
      return sendApiResponse(
        res,
        new ApiResponse({
          data: token,
          statusCode: HTTPSTATUS.OK,
        })
      );
    }
  ),
};

export default chatController;
