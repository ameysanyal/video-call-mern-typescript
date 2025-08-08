import express from "express";
import { protectRoute } from "@/middlewares/auth.middleware.js";
import chatController from "@/controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, chatController.getStreamToken);

export default router;

/**
 * @swagger
 * /api/chat/token:
 *   get:
 *     tags:
 *       - chat
 *     summary: Get Stream Chat token
 *     description: Returns a Stream Chat token for the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Token retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   description: Stream Chat token
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */
