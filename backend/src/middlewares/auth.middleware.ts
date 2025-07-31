import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model.js";
import { Env } from "../config/env.config.js";
import { Request, Response, NextFunction } from "express";
import { UserDocument } from "../models/user.model.js";

// Extend Express Request interface to include user
declare module "express-serve-static-core" {
  interface Request {
    user?: UserDocument;
  }
}

interface DecodedToken extends JwtPayload {
  userId: string;
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, Env.JWT_SECRET_KEY) as DecodedToken;

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    //This tells Mongoose to exclude the password field from the returned user document.
    // The "-" (minus) sign indicates exclusion.
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
