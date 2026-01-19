import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Invitation } from "../models/Invitation.model";
import { Room } from "../models/Room.model";
import { User } from "../models/User.model";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import { sendInvitationEmail } from "../services/email.service";
import mongoose from "mongoose";
import env from "../config/env";

// SEND INVITATION
export const sendInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, inviteeEmail, personalMessage } = req.body;

    if (!roomId || !inviteeEmail) {
      throw new AppError("Room ID and invitee email are required", 400);
    }

    if (!mongoose.isValidObjectId(roomId)) {
      throw new AppError("Invalid room ID", 400);
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(inviteeEmail)) {
      throw new AppError("Invalid email address", 400);
    }

    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check permissions
    const isOwner = room.owner.toString() === req.user?.id;
    const isMember = room.members.some(
      (member) => member.toString() === req.user?.id
    );

    if (!isOwner && !(isMember && room.settings.allowMemberInvites)) {
      throw new AppError("You don't have permission to send invitations", 403);
    }

    // Check if room is at capacity
    if (room.members.length >= room.maxMembers) {
      throw new AppError("Room has reached maximum capacity", 400);
    }

    // Check if user with this email is already a member
    const existingUser = await User.findOne({
      email: inviteeEmail.toLowerCase(),
    });
    if (existingUser) {
      const isAlreadyMember = room.members.some(
        (member) => member.toString() === existingUser._id.toString()
      );
      if (isAlreadyMember) {
        throw new AppError("User is already a member of this room", 400);
      }
    }

    // Check for existing pending invitation
    const existingInvitation = await Invitation.findOne({
      room: roomId,
      inviteeEmail: inviteeEmail.toLowerCase(),
      status: "pending",
      expiresAt: { $gt: new Date() },
    });

    if (existingInvitation) {
      throw new AppError(
        "An invitation has already been sent to this email",
        400
      );
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString("hex");

    // Create invitation with 7-day expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = new Invitation({
      room: roomId,
      inviter: req.user?.id,
      inviteeEmail: inviteeEmail.toLowerCase(),
      inviteeUser: existingUser?._id,
      token,
      status: "pending",
      expiresAt,
      personalMessage,
    });

    await invitation.save();

    // Populate invitation data
    await invitation.populate("room", "name description avatar");
    await invitation.populate("inviter", "username displayName avatar");

    // Send invitation email
    try {
      const invitationLink = `${env.FRONTEND_URL}/invitation/accept/${token}`;
      await sendInvitationEmail({
        to: inviteeEmail,
        inviterName:
          (invitation.inviter as any).displayName ||
          (invitation.inviter as any).username,
        roomName: (invitation.room as any).name,
        invitationLink,
        personalMessage,
      });

      logger.success(`Invitation sent to ${inviteeEmail} for room ${roomId}`);
    } catch (emailError) {
      logger.error(`Failed to send invitation email: ${emailError}`);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      invitation: {
        id: invitation._id,
        room: invitation.room,
        inviteeEmail: invitation.inviteeEmail,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ACCEPT INVITATION
export const acceptInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError("Invitation token is required", 400);
    }

    const invitation = await Invitation.findOne({ token })
      .populate("room")
      .populate("inviter", "username displayName");

    if (!invitation) {
      throw new AppError("Invalid invitation token", 404);
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      throw new AppError(
        `Invitation has already been ${invitation.status}`,
        400
      );
    }

    // Check if invitation has expired
    if (invitation.isExpired || invitation.expiresAt < new Date()) {
      invitation.status = "expired";
      await invitation.save();
      throw new AppError("Invitation has expired", 400);
    }

    const room = await Room.findById(invitation.room);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    // Check if user is already a member
    const isAlreadyMember = room.members.some(
      (member) => member.toString() === req.user?.id
    );

    if (isAlreadyMember) {
      throw new AppError("You are already a member of this room", 400);
    }

    // Check room capacity
    if (room.members.length >= room.maxMembers) {
      throw new AppError("Room has reached maximum capacity", 400);
    }

    // Add user to room
    room.members.push(req.user?.id as any);
    room.lastActivity = new Date();
    await room.save();

    // Update invitation status
    invitation.status = "accepted";
    invitation.acceptedAt = new Date();
    await invitation.save();

    logger.success(
      `Invitation accepted by user ${req.user?.id} for room ${room._id}`
    );

    await room.populate("owner", "username displayName avatar");
    await room.populate("members", "username displayName avatar status");

    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      room,
    });
  } catch (error) {
    next(error);
  }
};

// DECLINE INVITATION
export const declineInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError("Invitation token is required", 400);
    }

    const invitation = await Invitation.findOne({ token });

    if (!invitation) {
      throw new AppError("Invalid invitation token", 404);
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      throw new AppError(
        `Invitation has already been ${invitation.status}`,
        400
      );
    }

    // Update invitation status
    invitation.status = "declined";
    await invitation.save();

    logger.success(`Invitation declined for room ${invitation.room}`);

    res.status(200).json({
      success: true,
      message: "Invitation declined",
    });
  } catch (error) {
    next(error);
  }
};

// GET PENDING INVITATIONS (for a user)
export const getPendingInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    const invitations = await Invitation.find({
      inviteeEmail: user.email,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })
      .populate("room", "name description avatar")
      .populate("inviter", "username displayName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

// GET SENT INVITATIONS (invitations sent by user)
export const getSentInvitations = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.query;

    const filter: any = { inviter: req.user?.id };

    if (roomId) {
      if (!mongoose.isValidObjectId(roomId as string)) {
        throw new AppError("Invalid room ID", 400);
      }
      filter.room = roomId;
    }

    const invitations = await Invitation.find(filter)
      .populate("room", "name description avatar")
      .populate("inviteeUser", "username displayName avatar")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invitations.length,
      invitations,
    });
  } catch (error) {
    next(error);
  }
};

// CANCEL INVITATION
export const cancelInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid invitation ID", 400);
    }

    const invitation = await Invitation.findById(id);

    if (!invitation) {
      throw new AppError("Invitation not found", 404);
    }

    // Only the inviter can cancel
    if (invitation.inviter.toString() !== req.user?.id) {
      throw new AppError("Only the inviter can cancel this invitation", 403);
    }

    // Can only cancel pending invitations
    if (invitation.status !== "pending") {
      throw new AppError("Can only cancel pending invitations", 400);
    }

    invitation.status = "cancelled";
    await invitation.save();

    logger.success(`Invitation cancelled: ${id}`);

    res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// RESEND INVITATION
export const resendInvitation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid invitation ID", 400);
    }

    const invitation = await Invitation.findById(id)
      .populate("room", "name description avatar")
      .populate("inviter", "username displayName avatar");

    if (!invitation) {
      throw new AppError("Invitation not found", 404);
    }

    // Only the inviter can resend
    if ((invitation.inviter as any)._id.toString() !== req.user?.id) {
      throw new AppError("Only the inviter can resend this invitation", 403);
    }

    // Can only resend pending invitations
    if (invitation.status !== "pending") {
      throw new AppError("Can only resend pending invitations", 400);
    }

    // Generate new token and extend expiry
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    invitation.token = token;
    invitation.expiresAt = expiresAt;
    await invitation.save();

    // Resend email
    try {
      const invitationLink = `${env.FRONTEND_URL}/invitation/accept/${token}`;
      await sendInvitationEmail({
        to: invitation.inviteeEmail,
        inviterName:
          (invitation.inviter as any).displayName ||
          (invitation.inviter as any).username,
        roomName: (invitation.room as any).name,
        invitationLink,
        personalMessage: invitation.personalMessage,
      });

      logger.success(`Invitation resent to ${invitation.inviteeEmail}`);
    } catch (emailError) {
      logger.error(`Failed to resend invitation email: ${emailError}`);
      throw new AppError("Failed to resend invitation email", 500);
    }

    res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET INVITATION BY TOKEN (public - for viewing invitation details)
export const getInvitationByToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError("Invitation token is required", 400);
    }

    const invitation = await Invitation.findOne({ token })
      .populate("room", "name description avatar isPrivate")
      .populate("inviter", "username displayName avatar");

    if (!invitation) {
      throw new AppError("Invalid invitation token", 404);
    }

    // Check if expired
    if (invitation.isExpired || invitation.expiresAt < new Date()) {
      if (invitation.status === "pending") {
        invitation.status = "expired";
        await invitation.save();
      }
    }

    res.status(200).json({
      success: true,
      invitation: {
        id: invitation._id,
        room: invitation.room,
        inviter: invitation.inviter,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        personalMessage: invitation.personalMessage,
        isExpired: invitation.isExpired,
      },
    });
  } catch (error) {
    next(error);
  }
};
