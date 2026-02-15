import { Router } from "express";
import { authenticate } from "../middleware/auth";
import * as taskController from "../controllers/task.controller";

const router = Router();

// All routes require authentication
router.use(authenticate);

// Task CRUD for a specific room
router.post("/rooms/:roomId/tasks", taskController.createTask);
router.get("/rooms/:roomId/tasks", taskController.getRoomTasks);
router.get("/tasks/:id", taskController.getTaskById);
router.put("/tasks/:id", taskController.updateTask);
router.delete("/tasks/:id", taskController.deleteTask);

// Task actions
router.post("/tasks/:id/claim", taskController.claimTask);
router.post("/tasks/:id/unclaim", taskController.unclaimTask);
router.post("/tasks/:id/assign", taskController.assignTask);
router.post("/tasks/:id/unassign", taskController.unassignTask);
router.post("/tasks/:id/comments", taskController.addComment);
router.put("/tasks/:id/checklist", taskController.updateChecklist);
router.post("/tasks/:id/watch", taskController.addWatcher);
router.delete("/tasks/:id/watch", taskController.removeWatcher);

export default router;
