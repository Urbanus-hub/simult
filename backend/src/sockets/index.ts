import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { logger } from "../utils/logger";
import { User } from "../models/User.model";
import { Room } from "../models/Room.model";
import { Message } from "../models/Message.model";
import { Task } from "../models/Task.model";
import env from "../config/env";
import mongoose from "mongoose";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: any;
}

// Store online users: userId -> Set of socket IDs
const onlineUsers = new Map<string, Set<string>>();

// Socket authentication middleware
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: Error) => void
) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET as string) as {
      id: string;
    };

    // Fetch user
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.userId = decoded.id;
    socket.user = user;

    next();
  } catch (error: any) {
    logger.error(`Socket authentication failed: ${error.message}`);
    next(new Error("Authentication error: Invalid token"));
  }
};

export const setupSocketIO = (io: Server) => {
  // Apply authentication middleware
  io.use(socketAuthMiddleware);

  io.on("connection", async (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    const user = socket.user;

    logger.success(
      `User ${user.username} (${userId}) connected - Socket: ${socket.id}`
    );

    // Track online user
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    // Update user status to online
    try {
      await User.findByIdAndUpdate(userId, {
        status: "online",
        lastActive: new Date(),
      });
    } catch (error) {
      logger.error(`Failed to update user status: ${error}`);
    }

    // Send welcome message
    socket.emit("connected", {
      message: "Connected to Simult",
      userId,
      socketId: socket.id,
    });

    // Broadcast user online status to relevant rooms
    broadcastUserStatus(io, userId, "online");

    // ============ ROOM EVENTS ============

    // Join room
    socket.on("join_room", async (roomId: string) => {
      try {
        if (!mongoose.isValidObjectId(roomId)) {
          socket.emit("error", { message: "Invalid room ID" });
          return;
        }

        const room = await Room.findById(roomId);
        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        // Check if user is a member
        const isMember = room.members.some((m) => m.toString() === userId);
        if (!isMember) {
          socket.emit("error", { message: "Not a member of this room" });
          return;
        }

        // Join socket room
        socket.join(`room:${roomId}`);
        logger.info(`User ${userId} joined room ${roomId}`);

        // Notify others in the room
        socket.to(`room:${roomId}`).emit("user_joined_room", {
          roomId,
          user: {
            id: userId,
            username: user.username,
            displayName: user.displayName,
            avatar: user.avatar,
          },
        });

        socket.emit("joined_room", {
          roomId,
          message: "Successfully joined room",
        });
      } catch (error: any) {
        logger.error(`Error joining room: ${error.message}`);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // Leave room
    socket.on("leave_room", (roomId: string) => {
      socket.leave(`room:${roomId}`);
      logger.info(`User ${userId} left room ${roomId}`);

      socket.to(`room:${roomId}`).emit("user_left_room", {
        roomId,
        userId,
        username: user.username,
      });
    });

    // ============ MESSAGE EVENTS ============

    // Send room message
    socket.on(
      "room_message",
      async (data: { roomId: string; content: string; replyTo?: string }) => {
        try {
          const { roomId, content, replyTo } = data;

          if (!content || content.trim().length === 0) {
            socket.emit("error", { message: "Message content is required" });
            return;
          }

          // Verify room membership
          const room = await Room.findById(roomId);
          if (!room || !room.members.some((m) => m.toString() === userId)) {
            socket.emit("error", { message: "Access denied" });
            return;
          }

          // Create message
          const message = new Message({
            messageType: "room",
            room: roomId,
            sender: userId,
            content: content.trim(),
            contentType: "text",
            replyTo: replyTo || undefined,
          });

          await message.save();

          // Update room activity
          room.lastActivity = new Date();
          room.messageCount = (room.messageCount || 0) + 1;
          await room.save();

          await message.populate("sender", "username displayName avatar");
          if (message.replyTo) {
            await message.populate("replyTo", "content sender");
          }

          // Broadcast to all room members
          io.to(`room:${roomId}`).emit("room_message_received", {
            roomId,
            message,
          });

          logger.info(`Room message sent in ${roomId} by user ${userId}`);
        } catch (error: any) {
          logger.error(`Error sending room message: ${error.message}`);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Send direct message
    socket.on(
      "direct_message",
      async (data: {
        recipientId: string;
        content: string;
        replyTo?: string;
      }) => {
        try {
          const { recipientId, content, replyTo } = data;

          if (!content || content.trim().length === 0) {
            socket.emit("error", { message: "Message content is required" });
            return;
          }

          if (!mongoose.isValidObjectId(recipientId)) {
            socket.emit("error", { message: "Invalid recipient ID" });
            return;
          }

          // Check recipient exists
          const recipient = await User.findById(recipientId);
          if (!recipient) {
            socket.emit("error", { message: "Recipient not found" });
            return;
          }

          // Create message
          const message = new Message({
            messageType: "direct",
            sender: userId,
            recipient: recipientId,
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

          // Send to recipient's sockets
          const recipientSockets = onlineUsers.get(recipientId);
          if (recipientSockets) {
            recipientSockets.forEach((socketId) => {
              io.to(socketId).emit("direct_message_received", {
                message,
              });
            });
          }

          // Confirm to sender
          socket.emit("direct_message_sent", {
            message,
          });

          logger.info(`Direct message sent from ${userId} to ${recipientId}`);
        } catch (error: any) {
          logger.error(`Error sending direct message: ${error.message}`);
          socket.emit("error", { message: "Failed to send message" });
        }
      }
    );

    // Typing indicator for room
    socket.on("typing_room", (data: { roomId: string; isTyping: boolean }) => {
      socket.to(`room:${data.roomId}`).emit("user_typing_room", {
        roomId: data.roomId,
        userId,
        username: user.username,
        isTyping: data.isTyping,
      });
    });

    // Typing indicator for direct message
    socket.on(
      "typing_direct",
      (data: { recipientId: string; isTyping: boolean }) => {
        const recipientSockets = onlineUsers.get(data.recipientId);
        if (recipientSockets) {
          recipientSockets.forEach((socketId) => {
            io.to(socketId).emit("user_typing_direct", {
              userId,
              username: user.username,
              isTyping: data.isTyping,
            });
          });
        }
      }
    );

    // ============ TASK EVENTS ============

    // Task created
    socket.on(
      "task_created",
      async (data: { roomId: string; taskId: string }) => {
        try {
          const task = await Task.findById(data.taskId)
            .populate("createdBy", "username displayName avatar")
            .populate("assignedTo", "username displayName avatar");

          if (task) {
            io.to(`room:${data.roomId}`).emit("task_created", {
              roomId: data.roomId,
              task,
            });
          }
        } catch (error) {
          logger.error(`Error broadcasting task creation: ${error}`);
        }
      }
    );

    // Task updated
    socket.on(
      "task_updated",
      async (data: { roomId: string; taskId: string }) => {
        try {
          const task = await Task.findById(data.taskId)
            .populate("createdBy", "username displayName avatar")
            .populate("assignedTo", "username displayName avatar");

          if (task) {
            io.to(`room:${data.roomId}`).emit("task_updated", {
              roomId: data.roomId,
              task,
            });
          }
        } catch (error) {
          logger.error(`Error broadcasting task update: ${error}`);
        }
      }
    );

    // Task claimed
    socket.on(
      "task_claimed",
      async (data: { roomId: string; taskId: string }) => {
        try {
          const task = await Task.findById(data.taskId)
            .populate("createdBy", "username displayName avatar")
            .populate("assignedTo", "username displayName avatar");

          if (task) {
            io.to(`room:${data.roomId}`).emit("task_claimed", {
              roomId: data.roomId,
              task,
            });
          }
        } catch (error) {
          logger.error(`Error broadcasting task claim: ${error}`);
        }
      }
    );

    // Task deleted
    socket.on("task_deleted", (data: { roomId: string; taskId: string }) => {
      io.to(`room:${data.roomId}`).emit("task_deleted", {
        roomId: data.roomId,
        taskId: data.taskId,
      });
    });

    // ============ PRESENCE EVENTS ============

    // Update status
    socket.on("update_status", async (status: "online" | "away" | "busy") => {
      try {
        await User.findByIdAndUpdate(userId, { status });
        broadcastUserStatus(io, userId, status);
        logger.info(`User ${userId} changed status to ${status}`);
      } catch (error) {
        logger.error(`Error updating status: ${error}`);
      }
    });

    // ============ DISCONNECT ============

    socket.on("disconnect", async (reason: string) => {
      logger.warn(
        `User ${userId} disconnected - Socket: ${socket.id}, Reason: ${reason}`
      );

      // Remove socket from online users
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If user has no more sockets, mark as offline
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);

          try {
            await User.findByIdAndUpdate(userId, {
              status: "offline",
              lastActive: new Date(),
            });

            broadcastUserStatus(io, userId, "offline");
          } catch (error) {
            logger.error(`Error updating user status on disconnect: ${error}`);
          }
        }
      }
    });
  });

  logger.success("Socket.IO setup complete with authentication");
};

// Helper function to broadcast user status to relevant rooms
async function broadcastUserStatus(io: Server, userId: string, status: string) {
  try {
    // Find all rooms the user is a member of
    const rooms = await Room.find({ members: userId });

    // Broadcast to all room members
    rooms.forEach((room) => {
      io.to(`room:${room._id}`).emit("user_status_changed", {
        userId,
        status,
      });
    });
  } catch (error) {
    logger.error(`Error broadcasting user status: ${error}`);
  }
}

// Export online users for use in other parts of the application
export { onlineUsers };
