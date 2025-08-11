import express from 'express';
import { protectRoute } from '@/middlewares/auth.middleware.js';
import userController from '@/controllers/user.controller.js';
import { validate } from '@/middlewares/validateSchema.middleware.js';
import { sendFriendRequestSchema, acceptFriendRequestSchema } from '@/validators/user.validator.js';

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get('/', userController.getRecommendedUsers);
router.get('/friends', userController.getMyFriends);

router.post(
  '/friend-request/:id',
  validate(sendFriendRequestSchema),
  userController.sendFriendRequest
);
router.put(
  '/friend-request/:id/accept',
  validate(acceptFriendRequestSchema),
  userController.acceptFriendRequest
);

router.get('/friend-requests', userController.getFriendRequests);
router.get('/outgoing-friend-requests', userController.getOutgoingFriendReqs);

export default router;

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags:
 *       - users
 *     summary: Get recommended users
 *     description: Returns a list of users that the authenticated user might want to connect with, excluding existing friends.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Recommended users retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

/**
 * @swagger
 * /api/users/friends:
 *   get:
 *     tags:
 *       - users
 *     summary: Get current user's friends
 *     description: Retrieves the list of friends for the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Friends list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '404':
 *         description: User not found.
 */

/**
 * @swagger
 * /api/users/friend-request/{id}:
 *   post:
 *     tags:
 *       - users
 *     summary: Send a friend request
 *     description: Sends a friend request from the authenticated user to another user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the recipient user
 *         schema:
 *           type: string
 *
 *     responses:
 *       '201':
 *         description: Friend request sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/FriendRequest'
 *       '400':
 *         description: Bad request (e.g. already friends, self-request, or request already exists).
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '404':
 *         description: Recipient not found.
 */

/**
 * @swagger
 * /api/users/friend-request/{id}/accept:
 *   put:
 *     tags:
 *       - users
 *     summary: Accept a friend request
 *     description: Allows the recipient of a friend request to accept it and establish a friendship.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the friend request to accept
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Friend request accepted
 *     responses:
 *       '200':
 *         description: Friend request accepted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Friend request accepted
 *       '403':
 *         description: Forbidden. You are not authorized to accept this request.
 *       '404':
 *         description: Friend request not found.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

/**
 * @swagger
 * /api/users/friend-requests:
 *   get:
 *     tags:
 *       - users
 *     summary: Get incoming and accepted friend requests
 *     description: Retrieves incoming pending friend requests and outgoing accepted requests for the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Friend requests retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     incomingReqs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FriendRequest'
 *                     acceptedReqs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/FriendRequest'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */

/**
 * @swagger
 * /api/users/outgoing-friend-requests:
 *   get:
 *     tags:
 *       - users
 *     summary: Get outgoing friend requests
 *     description: Retrieves all pending outgoing friend requests sent by the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Outgoing friend requests retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/FriendRequest'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */
