import { Server, Socket } from "socket.io";
import { logger } from "../utils/logger";

export const setupSocketIO = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    logger.success(`User connected - Socket ID: ${socket.id}`);

    socket.emit("welcome", "Welcome to Simult!");

    socket.on("message", (message: string) => {
      logger.info(`Message from ${socket.id}: ${message}`);
      io.emit("newMessage", message);
    });

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      logger.info(`Socket ${socket.id} joined room: ${roomId}`);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      logger.info(`Socket ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit("user-left", socket.id);
    });

    socket.on(
      "room-message",
      ({ roomId, message }: { roomId: string; message: string }) => {
        logger.info(`Room message in ${roomId} from ${socket.id}: ${message}`);
        socket
          .to(roomId)
          .emit("room-message", { socketId: socket.id, message });
      }
    );

    socket.on("disconnect", (reason: string) => {
      logger.warn(
        `User disconnected - Socket ID: ${socket.id}, Reason: ${reason}`
      );
    });
  });

  logger.success("Socket.IO setup complete");
};
