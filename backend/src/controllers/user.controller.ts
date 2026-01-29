import { Request, Response, NextFunction } from "express";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";

// SEARCH USERS
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(200).json({ success: true, users: [] });
    }

    // Search by username or email settings
    // Exclude current user from results if authenticated
    // Limit results to 10
    
    // Using a regex for case-insensitive partial match
    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $or: [
        { username: searchRegex },
        { email: searchRegex },
        { displayName: searchRegex }
      ]
    })
    .select("id username email displayName avatar")
    .limit(10);

    res.status(200).json({
      success: true,
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar
      }))
    });
  } catch (error) {
    next(error);
  }
};
