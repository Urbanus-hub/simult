import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as messageController from "../controllers/message.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Room messages
router.get("/rooms/:roomId/messages", messageController.getRoomMessages);
router.post("/rooms/:roomId/messages", messageController.sendRoomMessage);

// Direct messages
router.get("/direct/:userId", messageController.getDirectMessages);
router.post("/direct/:userId", messageController.sendDirectMessage);
router.get("/conversations", messageController.getConversations);

// Message actions
router.put("/:id", messageController.editMessage);
router.delete("/:id", messageController.deleteMessage);
router.post("/:id/read", messageController.markMessageAsRead);
router.post("/:id/reactions", messageController.addReaction);
router.delete("/:id/reactions", messageController.removeReaction);

export default router;
