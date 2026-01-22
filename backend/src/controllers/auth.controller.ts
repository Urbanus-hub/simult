import { NextFunction, Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import env from "../config/env";
import { logger } from "../utils/logger";

interface AuthRequest extends Request {
  user?: any;
}

interface RegisterBody {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

// Generate JWT Token
const generateToken = (userId: string): string => {
  
  return jwt.sign({ id: userId }, env.JWT_SECRET as string, {expiresIn: env.JWT_EXPIRE} as SignOptions);
};

// REGISTER
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password, displayName } = req.body as RegisterBody;

    // Validation
    if (!username || !email || !password) {
      throw new AppError("Username, email, and password are required", 400);
    }

    if (password.length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new AppError("Email or username already in use", 409);
    }

    // Create user
    const user = new User({
      username,
      email,
      password,
      displayName: displayName || username,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id as string);

    logger.success(`User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN
const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginBody;

    // Validation
    if (!email || !password) {
      throw new AppError("Email and password are required", 400);
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Update last active
    user.lastActive = new Date();
    user.status = "online";
    await user.save();

    // Generate token
    const token = generateToken(user._id as string);

    logger.success(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET PROFILE
const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new AppError("User not found", 404);
   
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role:user.role,
        avatar: user.avatar,
        bio: user.bio,
        status: user.status,
        customStatus: user.customStatus,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { displayName, bio, avatar, customStatus } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        ...(displayName && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(avatar && { avatar }),
        ...(customStatus !== undefined && { customStatus }),
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    logger.success(`User profile updated: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        bio: user.bio,
        customStatus: user.customStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT
const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { status: "offline", lastActive: new Date() },
      { new: true }
    );

    if (!user) {
      throw new AppError("User not found", 404);
    }

    logger.success(`User logged out: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ACCOUNT
const deleteAccount = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw new AppError("Password is required to delete account", 400);
    }

    // Verify password
    const user = await User.findById(req.user?.id).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError("Invalid password", 401);
    }

    // Delete user
    await User.findByIdAndDelete(req.user?.id);

    logger.success(`User account deleted: ${user.email}`);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// VERIFY TOKEN
const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export { register, login, logout, getProfile, updateProfile, deleteAccount };
