import { Request, Response, NextFunction } from "express";
import { Message } from "../models/Message.model";
import { Room } from "../models/Room.model";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

// GET ROOM MESSAGES
export const getRoomMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, before } = req.query;

    if (!mongoose.isValidObjectId(roomId)) {
      throw new AppError("Invalid room ID", 400);
    }

    // Check if room exists and user is a member
    const room = await Room.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const isMember = room.members.some(
      (member) => member.toString() === req.user?.id
    );

    if (!isMember) {
      throw new AppError(
        "Access denied. You are not a member of this room",
        403
      );
    }

    // Build query
    const query: any = {
      messageType: "room",
      room: roomId,
      isDeleted: false,
    };

    // Pagination: get messages before a specific message ID or timestamp
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .populate("sender", "username displayName avatar status")
      .populate("replyTo", "content sender")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Reverse to show oldest first
    messages.reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// SEND ROOM MESSAGE (Fallback REST endpoint)
export const sendRoomMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { content, replyTo } = req.body;

    if (!mongoose.isValidObjectId(roomId)) {
      throw new AppError("Invalid room ID", 400);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError("Message content is required", 400);
    }

    // Check if room exists and user is a member
    const room = await Room.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const isMember = room.members.some(
      (member) => member.toString() === req.user?.id
    );

    if (!isMember) {
      throw new AppError(
        "Access denied. You are not a member of this room",
        403
      );
    }

    // Create message
    const message = new Message({
      messageType: "room",
      room: roomId,
      sender: req.user?.id,
      content: content.trim(),
      contentType: "text",
      replyTo: replyTo || undefined,
    });

    await message.save();

    // Update room activity and message count
    room.lastActivity = new Date();
    room.messageCount = (room.messageCount || 0) + 1;
    await room.save();

    await message.populate("sender", "username displayName avatar");
    if (message.replyTo) {
      await message.populate("replyTo", "content sender");
    }

    // Emit socket event
    const io = (req.app.get("io") as any) || (global as any).io;
    if (io) {
        io.to(roomId).emit("receive_message", message);
    }

    logger.success(`Room message sent in room ${roomId}`);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// GET DIRECT MESSAGES
export const getDirectMessages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { limit = 50, before } = req.query;

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    // Check if other user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      throw new AppError("User not found", 404);
    }

    // Build query for messages between two users
    const query: any = {
      messageType: "direct",
      isDeleted: false,
      $or: [
        { sender: req.user?.id, recipient: userId },
        { sender: userId, recipient: req.user?.id },
      ],
    };

    // Pagination
    if (before) {
      query.createdAt = { $lt: new Date(before as string) };
    }

    const messages = await Message.find(query)
      .populate("sender", "username displayName avatar status")
      .populate("recipient", "username displayName avatar status")
      .populate("replyTo", "content sender")
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    // Reverse to show oldest first
    messages.reverse();

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// SEND DIRECT MESSAGE (Fallback REST endpoint)
export const sendDirectMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { content, replyTo } = req.body;

    if (!mongoose.isValidObjectId(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError("Message content is required", 400);
    }

    // Check if recipient exists
    const recipient = await User.findById(userId);
    if (!recipient) {
      throw new AppError("Recipient not found", 404);
    }

    // Cannot send message to self
    if (userId === req.user?.id) {
      throw new AppError("Cannot send message to yourself", 400);
    }

    // Create message
    const message = new Message({
      messageType: "direct",
      sender: req.user?.id,
      recipient: userId,
      content: content.trim(),
      contentType: "text",
      replyTo: replyTo || undefined,
    });

    await message.save();

    await message.populate("sender", "username displayName avatar");
    await message.populate("recipient", "username displayName avatar");
    if (message.replyTo) {
      await message.populate("replyTo", "content sender");
    }

    // Emit socket event to both sender and recipient
    const io = (req.app.get("io") as any);
    if (io) {
        // Emit to recipient's personal room (userId)
        io.to(userId).emit("receive_message", message);
        // Emit to sender's personal room (userId) so they see it too via socket
        io.to(req.user?.id).emit("receive_message", message);
    }

    logger.success(`Direct message sent from ${req.user?.id} to ${userId}`);

    res.status(201).json({
      success: true,
      message,
    });
  } catch (error) {
    next(error);
  }
};

// EDIT MESSAGE
export const editMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid message ID", 400);
    }

    if (!content || content.trim().length === 0) {
      throw new AppError("Message content is required", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Only sender can edit their message
    if (message.sender.toString() !== req.user?.id) {
      throw new AppError("You can only edit your own messages", 403);
    }

    // Cannot edit deleted messages
    if (message.isDeleted) {
      throw new AppError("Cannot edit deleted messages", 400);
    }

    // Update message
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    await message.populate("sender", "username displayName avatar");

    logger.success(`Message edited: ${id}`);

    res.status(200).json({
      success: true,
      message: "Message edited successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE MESSAGE
export const deleteMessage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid message ID", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Check authorization: sender can delete, or room owner for room messages
    let canDelete = message.sender.toString() === req.user?.id;

    if (!canDelete && message.messageType === "room" && message.room) {
      const room = await Room.findById(message.room);
      if (room && room.owner.toString() === req.user?.id) {
        canDelete = true;
      }
    }

    if (!canDelete) {
      throw new AppError(
        "You don't have permission to delete this message",
        403
      );
    }

    // Soft delete
    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = "[Message deleted]";

    await message.save();

    logger.success(`Message deleted: ${id}`);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// MARK MESSAGE AS READ
export const markMessageAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid message ID", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Check if already marked as read by this user
    const alreadyRead = message.readBy.some(
      (read: any) => read.user.toString() === req.user?.id
    );

    if (alreadyRead) {
      return res.status(200).json({
        success: true,
        message: "Message already marked as read",
      });
    }

    // Add to readBy array
    message.readBy.push({
      user: req.user?.id as any,
      readAt: new Date(),
    });

    await message.save();

    res.status(200).json({
      success: true,
      message: "Message marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// ADD REACTION
export const addReaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid message ID", 400);
    }

    if (!emoji) {
      throw new AppError("Emoji is required", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Find existing reaction with this emoji
    const existingReaction = message.reactions.find((r) => r.emoji === emoji);

    if (existingReaction) {
      // Check if user already reacted
      const userReacted = existingReaction.users.some(
        (userId) => userId.toString() === req.user?.id
      );

      if (userReacted) {
        throw new AppError("You already reacted with this emoji", 400);
      }

      // Add user to existing reaction
      existingReaction.users.push(req.user?.id as any);
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [req.user?.id as any],
      });
    }

    await message.save();

    logger.success(`Reaction added to message: ${id}`);

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      data: message.reactions,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE REACTION
export const removeReaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid message ID", 400);
    }

    if (!emoji) {
      throw new AppError("Emoji is required", 400);
    }

    const message = await Message.findById(id);

    if (!message) {
      throw new AppError("Message not found", 404);
    }

    // Find reaction
    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex === -1) {
      throw new AppError("Reaction not found", 404);
    }

    const reaction = message.reactions[reactionIndex];

    // Remove user from reaction
    const userIndex = reaction.users.findIndex(
      (userId) => userId.toString() === req.user?.id
    );

    if (userIndex === -1) {
      throw new AppError("You haven't reacted with this emoji", 400);
    }

    reaction.users.splice(userIndex, 1);

    // Remove reaction if no users left
    if (reaction.users.length === 0) {
      message.reactions.splice(reactionIndex, 1);
    }

    await message.save();

    logger.success(`Reaction removed from message: ${id}`);

    res.status(200).json({
      success: true,
      message: "Reaction removed successfully",
      data: message.reactions,
    });
  } catch (error) {
    next(error);
  }
};

// GET CONVERSATIONS LIST (All direct message conversations)
export const getConversations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all unique users the current user has messaged with
    const conversations = await Message.aggregate([
      {
        $match: {
          messageType: "direct",
          $or: [
            { sender: req.user?.id as any },
            { recipient: req.user?.id as any },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$sender", req.user?.id as any] },
              "$recipient",
              "$sender",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    {
                      $eq: [
                        "$recipient",
                        req.user?.id as any,
                      ],
                    },
                    {
                      $not: {
                        $in: [
                          req.user?.id as any,
                          "$readBy.user",
                        ],
                      },
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          user: {
            _id: 1,
            username: 1,
            displayName: 1,
            avatar: 1,
            status: 1,
          },
          lastMessage: {
            content: 1,
            createdAt: 1,
            sender: 1,
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    next(error);
  }
};
