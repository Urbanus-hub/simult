import mongoose from "mongoose";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns boolean - True if valid ObjectId, false otherwise
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.isValidObjectId(id);
};
