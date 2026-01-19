import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../middleware/errorHandler";
import env from "../config/env";

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// Authenticate middleware
export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new AppError("Not authorized no token provided", 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    req.user = { id: decoded.id };

    next();
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("Token has expired", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }
    next(error);
  }
};

// Optional authentication - doesn't fail if token is missing
export const optionalAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
      req.user = { id: decoded.id };
    }
  } catch (error) {
    // Silently fail - token is optional
  }

  next();
};
