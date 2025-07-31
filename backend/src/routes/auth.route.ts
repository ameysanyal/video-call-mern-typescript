import express from "express";
import authController from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { signupSchema, loginSchema, onboardSchema } from "../validators/auth.validator.js";
import { validate } from "../middlewares/validateSchema.middleware.js";

const router = express.Router();

router.post("/signup", validate(signupSchema), authController.signup);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authController.logout);

router.post("/onboarding", protectRoute, validate(onboardSchema), authController.onboard);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;