import express from "express";
import authController from "@/controllers/auth.controller.js";
import { protectRoute } from "@/middlewares/auth.middleware.js";
import {
  signupSchema,
  loginSchema,
  onboardSchema,
} from "@/validators/auth.validator.js";
import { validate } from "@/middlewares/validateSchema.middleware.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);

router.post("/login", validate(loginSchema), authController.login);

router.post("/logout", authController.logout);

router.post(
  "/onboarding",
  protectRoute,
  validate(onboardSchema),
  authController.onboard
);

router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
export default router;

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags:
 *       - auth
 *     summary: Register a new user
 *     description: Creates a new user account with a full name, email, and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupBody'
 *     responses:
 *       '201':
 *         description: User signed up successfully.
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
 *       '400':
 *         description: Bad request. Missing fields, invalid email, or email already exists.
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - auth
 *     summary: Log in a user
 *     description: Authenticates a user with their email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       '200':
 *         description: User logged in successfully.
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
 *       '400':
 *         description: Invalid email or password.
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - auth
 *     summary: Log out a user
 *     description: Clears the authentication cookie to log the user out.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: Logout successful.
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
 *                   example: Logout successful
 */

/**
 * @swagger
 * /api/auth/onboarding:
 *   post:
 *     tags:
 *       - auth
 *     summary: Complete user onboarding
 *     description: Updates a user's profile with onboarding details like native and learning languages.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardBody'
 *     responses:
 *       '200':
 *         description: User profile updated successfully.
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
 *       '400':
 *         description: Bad request, all fields are required.
 *       '401':
 *         description: Unauthorized. User not authenticated.
 *       '404':
 *         description: User not found.
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - auth
 *     summary: Get authenticated user details
 *     description: Returns the details of the currently logged-in user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       '200':
 *         description: User details retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized. User not authenticated.
 */
