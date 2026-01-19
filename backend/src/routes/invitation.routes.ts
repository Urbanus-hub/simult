import { Router } from "express";
import { authenticate, optionalAuth } from "../middleware/auth";
import * as invitationController from "../controllers/invitation.controller";

const router = Router();

// Public route - anyone with token can view
router.get("/token/:token", invitationController.getInvitationByToken);

// Protected routes
router.post("/send", authenticate, invitationController.sendInvitation);
router.post(
  "/accept/:token",
  authenticate,
  invitationController.acceptInvitation
);
router.post(
  "/decline/:token",
  authenticate,
  invitationController.declineInvitation
);
router.get(
  "/pending",
  authenticate,
  invitationController.getPendingInvitations
);
router.get("/sent", authenticate, invitationController.getSentInvitations);
router.delete("/:id", authenticate, invitationController.cancelInvitation);
router.post("/:id/resend", authenticate, invitationController.resendInvitation);

export default router;
