import { Request, Response, NextFunction } from "express";
import { Room } from "../models/Room.model";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

// CREATE ROOM
export const createRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      name,
      description,
      isPrivate,
      maxMembers,
      settings,
      avatar,
      color,
    } = req.body;

    // Validation
    if (!name) {
      throw new AppError("Room name is required", 400);
    }

    // Create room with owner as first member
    const room = new Room({
      name,
      description,
      owner: req.user?.id,
      members: [req.user?.id],
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      maxMembers: maxMembers || 50,
      settings: settings || {
        allowInvites: true,
        allowMemberInvites: true,
        muteNonMembers: false,
        requireApproval: false,
      },
      avatar,
      color,
      lastActivity: new Date(),
    });

    await room.save();

    // Populate owner and members
    await room.populate("owner", "username displayName avatar");
    await room.populate("members", "username displayName avatar status");

    logger.success(`Room created: ${name} by user ${req.user?.id}`);

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

// GET USER'S ROOMS
export const getUserRooms = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const rooms = await Room.find({
      members: req.user?.id,
    })
      .populate("owner", "username displayName avatar")
      .populate("members", "username displayName avatar status")
      .sort({ lastActivity: -1 });

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    next(error);
  }
};

// GET ROOM BY ID
export const getRoomById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid room ID", 400);
    }

    const room = await Room.findById(id)
      .populate("owner", "username displayName avatar email")
      .populate("members", "username displayName avatar status lastActive");

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is a member
    const isMember = room.members.some(
      (member: any) => member._id.toString() === req.user?.id
    );

    if (!isMember) {
      throw new AppError(
        "Access denied. You are not a member of this room",
        403
      );
    }

    res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE ROOM
export const updateRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      isPrivate,
      maxMembers,
      settings,
      avatar,
      color,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid room ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is the owner
    if (room.owner.toString() !== req.user?.id) {
      throw new AppError("Only the room owner can update the room", 403);
    }

    // Update fields
    if (name !== undefined) room.name = name;
    if (description !== undefined) room.description = description;
    if (isPrivate !== undefined) room.isPrivate = isPrivate;
    if (maxMembers !== undefined) room.maxMembers = maxMembers;
    if (settings !== undefined)
      room.settings = { ...room.settings, ...settings };
    if (avatar !== undefined) room.avatar = avatar;
    if (color !== undefined) room.color = color;

    await room.save();

    await room.populate("owner", "username displayName avatar");
    await room.populate("members", "username displayName avatar status");

    logger.success(`Room updated: ${room.name}`);

    res.status(200).json({
      success: true,
      message: "Room updated successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE ROOM
export const deleteRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid room ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is the owner
    if (room.owner.toString() !== req.user?.id) {
      throw new AppError("Only the room owner can delete the room", 403);
    }

    await Room.findByIdAndDelete(id);

    logger.success(`Room deleted: ${room.name}`);

    res.status(200).json({
      success: true,
      message: "Room deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// LEAVE ROOM
export const leaveRoom = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid room ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is a member
    const memberIndex = room.members.findIndex(
      (member) => member.toString() === req.user?.id
    );

    if (memberIndex === -1) {
      throw new AppError("You are not a member of this room", 400);
    }

    // Owner cannot leave, they must transfer ownership or delete the room
    if (room.owner.toString() === req.user?.id) {
      throw new AppError(
        "Room owner cannot leave. Transfer ownership or delete the room",
        400
      );
    }

    // Remove user from members
    room.members.splice(memberIndex, 1);
    await room.save();

    logger.success(`User ${req.user?.id} left room: ${room.name}`);

    res.status(200).json({
      success: true,
      message: "Left room successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ADD MEMBER TO ROOM
export const addMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(userId)
    ) {
      throw new AppError("Invalid room or user ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if requester is owner or member with invite permissions
    const isOwner = room.owner.toString() === req.user?.id;
    const isMember = room.members.some(
      (member) => member.toString() === req.user?.id
    );

    if (!isOwner && !(isMember && room.settings.allowMemberInvites)) {
      throw new AppError("You don't have permission to add members", 403);
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if already a member
    if (room.members.some((member) => member.toString() === userId)) {
      throw new AppError("User is already a member", 400);
    }

    // Check max members
    if (room.members.length >= room.maxMembers) {
      throw new AppError("Room has reached maximum capacity", 400);
    }

    // Add member
    room.members.push(userId as any);
    await room.save();

    await room.populate("members", "username displayName avatar status");

    logger.success(`User ${userId} added to room: ${room.name}`);

    res.status(200).json({
      success: true,
      message: "Member added successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE MEMBER FROM ROOM
export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, userId } = req.params;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(userId)
    ) {
      throw new AppError("Invalid room or user ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Only owner can remove members
    if (room.owner.toString() !== req.user?.id) {
      throw new AppError("Only the room owner can remove members", 403);
    }

    // Cannot remove owner
    if (room.owner.toString() === userId) {
      throw new AppError("Cannot remove the room owner", 400);
    }

    // Check if user is a member
    const memberIndex = room.members.findIndex(
      (member) => member.toString() === userId
    );

    if (memberIndex === -1) {
      throw new AppError("User is not a member of this room", 400);
    }

    // Remove member
    room.members.splice(memberIndex, 1);
    await room.save();

    logger.success(`User ${userId} removed from room: ${room.name}`);

    res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    next(error);
  }
};

// TRANSFER OWNERSHIP
export const transferOwnership = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { newOwnerId } = req.body;

    if (
      !mongoose.isValidObjectId(id) ||
      !mongoose.isValidObjectId(newOwnerId)
    ) {
      throw new AppError("Invalid room or user ID", 400);
    }

    const room = await Room.findById(id);

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Only current owner can transfer ownership
    if (room.owner.toString() !== req.user?.id) {
      throw new AppError("Only the room owner can transfer ownership", 403);
    }

    // Check if new owner is a member
    if (!room.members.some((member) => member.toString() === newOwnerId)) {
      throw new AppError("New owner must be a member of the room", 400);
    }

    // Transfer ownership
    room.owner = newOwnerId as any  ;
    await room.save();

    await room.populate("owner", "username displayName avatar");

    logger.success(
      `Ownership transferred in room: ${room.name} to user ${newOwnerId}`
    );

    res.status(200).json({
      success: true,
      message: "Ownership transferred successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

// GET ROOM MEMBERS
export const getRoomMembers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid room ID", 400);
    }

    const room = await Room.findById(id).populate(
      "members",
      "username displayName avatar status lastActive email"
    );

    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is a member
    const isMember = room.members.some(
      (member: any) => member._id.toString() === req.user?.id
    );

    if (!isMember) {
      throw new AppError(
        "Access denied. You are not a member of this room",
        403
      );
    }

    res.status(200).json({
      success: true,
      count: room.members.length,
      members: room.members,
    });
  } catch (error) {
    next(error);
  }
};
