import express from "express";
import { searchUsers } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.get("/users/search", authenticate, searchUsers);

export default router;
