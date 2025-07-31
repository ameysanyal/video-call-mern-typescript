import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import chatController from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, chatController.getStreamToken);

export default router;