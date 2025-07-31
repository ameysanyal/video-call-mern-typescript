import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import userController from "../controllers/user.controller.js";
import {validate} from "../middlewares/validateSchema.middleware.js"
import {sendFriendRequestSchema, acceptFriendRequestSchema} from "../validators/user.validator.js"

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", userController.getRecommendedUsers);
router.get("/friends", userController.getMyFriends);

router.post("/friend-request/:id",validate(sendFriendRequestSchema), userController.sendFriendRequest);
router.put("/friend-request/:id/accept", validate(acceptFriendRequestSchema), userController.acceptFriendRequest);

router.get("/friend-requests", userController.getFriendRequests);
router.get("/outgoing-friend-requests", userController.getOutgoingFriendReqs);

export default router;