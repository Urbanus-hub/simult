import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { connectDB } from "./config/database";
import { errorHandler } from "./middleware/errorHandler";
import { setupSocketIO } from "./sockets";
import { logger } from "./utils/logger";
import env from "./config/env";
import authRoutes from "./routes/auth.routes";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging and monitoring
app.use(express.json()); // JSON parsing
app.use(express.urlencoded({ extended: true })); // URL-encoded parsing

// Routes
app.get("/api/status", (req, res) => {
  res.json({ status: "API is running" });
});

// Auth routes
app.use("/api", authRoutes);

// Socket.IO setup
setupSocketIO(io);

// Error handling
app.use(errorHandler);

// Database connection and server start
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`Server running at http://localhost:${env.PORT}`);
  });
};

startServer();
