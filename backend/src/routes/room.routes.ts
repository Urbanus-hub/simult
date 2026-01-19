import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as roomController from "../controllers/room.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Room CRUD
router.post("/", roomController.createRoom);
router.get("/", roomController.getUserRooms);
router.get("/:id", roomController.getRoomById);
router.put("/:id", roomController.updateRoom);
router.delete("/:id", roomController.deleteRoom);

// Room actions
router.post("/:id/leave", roomController.leaveRoom);
router.post("/:id/members", roomController.addMember);
router.delete("/:id/members/:userId", roomController.removeMember);
router.put("/:id/transfer-ownership", roomController.transferOwnership);
router.get("/:id/members", roomController.getRoomMembers);

export default router;
