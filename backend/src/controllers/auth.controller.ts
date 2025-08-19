import { upsertStreamUser } from '@/lib/streamChat.js';
import { Request, Response } from 'express';
import { ApiResponse, sendApiResponse } from '@/utils/api-response.js';
import {
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@/utils/app-error.js';
import { asyncHandler } from '@/middlewares/asynchandler.middleware.js';
import { ErrorCodeEnum } from '@/enums/error-code.enum.js';
import { Env } from '@/config/env.config.js';
import { HTTPSTATUS } from '@/config/http.config.js';
import { UserDocument } from '@/models/user.model.js';
import { signJwtToken } from '@/lib/jwt.js';
import userService from '@/services/user.service.js';

const authController = {
  signup: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      throw new BadRequestException('All fields are required', ErrorCodeEnum.MISSING_FIELDS);
    }

    if (!email.endsWith('@streamify.com')) {
      throw new BadRequestException(
        'Email must end with @streamify.com',
        ErrorCodeEnum.VALIDATION_ERROR
      );
    }

    if (password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters',
        ErrorCodeEnum.VALIDATION_ERROR
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format', ErrorCodeEnum.VALIDATION_ERROR);
    }

    const existingUser = await userService.findUserByEmail(email);

    if (existingUser) {
      throw new BadRequestException(
        'Email already exists, please use a different one',
        ErrorCodeEnum.EMAIL_EXISTS
      );
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser: UserDocument = await userService.createUser({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    await upsertStreamUser({
      id: newUser._id.toString(),
      name: newUser.fullName,
      image: newUser.profilePic || '',
    });
    console.log(`Stream user created for ${newUser.fullName}`);

    const { token } = signJwtToken({ userId: newUser._id });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //Sets the cookie to expire after 7 days.
      httpOnly: true, // prevent XSS attacks,
      sameSite: Env.NODE_ENV === 'production' ? 'none' : 'strict', // This is also crucial for cross-origin cookies
      secure: Env.NODE_ENV === 'production', //This attribute ensures the cookie is only sent over HTTPS.
      path: '/',
    });

    return sendApiResponse(
      res,
      new ApiResponse({
        success: true,
        data: newUser,
        statusCode: HTTPSTATUS.CREATED,
      })
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestException('All fields are required', ErrorCodeEnum.MISSING_FIELDS);
    }

    const user = await userService.findUserByEmail(email);

    if (!user) throw new BadRequestException('User Not Found', ErrorCodeEnum.MISSING_FIELDS);

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect)
      throw new BadRequestException('Invalid email or password', ErrorCodeEnum.MISSING_FIELDS);

    const { token } = signJwtToken({ userId: user._id });

    res.cookie('jwt', token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, //Sets the cookie to expire after 7 days.
      httpOnly: true, // prevent XSS attacks,
      sameSite: Env.NODE_ENV === 'production' ? 'none' : 'strict', // This is also crucial for cross-origin cookies
      secure: Env.NODE_ENV === 'production', //This attribute ensures the cookie is only sent over HTTPS.
      path: '/',
    });

    // This attaches the token to the browser as a cookie named jwt.
    // Since it’s httpOnly, frontend JavaScript cannot read or modify it, which increases security.
    // sameSite: "strict" blocks the cookie from being sent in cross-site requests (CSRF protection).
    // secure: true ensures it's sent only over HTTPS in production.

    return sendApiResponse(
      res,
      new ApiResponse({
        success: true,
        data: user,
        statusCode: HTTPSTATUS.OK,
      })
    );
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    res.clearCookie('jwt', {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      sameSite: Env.NODE_ENV === 'production' ? 'none' : 'strict',
      path: '/',
    });

    return sendApiResponse(
      res,
      new ApiResponse({
        success: true,
        message: 'Logout successful',
        statusCode: HTTPSTATUS.OK,
      })
    );
  }),

  onboard: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user || !req.user._id) {
      throw new UnauthorizedException('Unauthorized: user not found in request');
    }

    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return res.status(400).json({
        message: 'All fields are required',
        missingFields: [
          !fullName && 'fullName',
          !bio && 'bio',
          !nativeLanguage && 'nativeLanguage',
          !learningLanguage && 'learningLanguage',
          !location && 'location',
        ].filter(Boolean),
      });
      //The .filter(Boolean) part is used to remove "falsy" values from the array, leaving only the "truthy" ones.
    }

    const updatedUser = await userService.updateUserById(userId, {
      ...req.body,
      isOnboarded: true,
    });

    if (!updatedUser) throw new NotFoundException('User not found');

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || '',
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log(
        'Error updating Stream user during onboarding:',
        streamError instanceof Error ? streamError.message : streamError
      );
    }

    return sendApiResponse(
      res,
      new ApiResponse({
        success: true,
        data: updatedUser,
        statusCode: HTTPSTATUS.OK,
      })
    );
  }),
};

export default authController;
