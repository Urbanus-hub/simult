import { Request, Response, NextFunction } from "express";
import { Task } from "../models/Task.model";
import { Room } from "../models/Room.model";
import { AppError } from "../middleware/errorHandler";
import { AuthRequest } from "../middleware/auth";
import { logger } from "../utils/logger";
import mongoose from "mongoose";

// CREATE TASK
export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { title, description, priority, dueDate, estimatedHours, tags } =
      req.body;

    if (!mongoose.isValidObjectId(roomId)) {
      throw new AppError("Invalid room ID", 400);
    }

    if (!title) {
      throw new AppError("Task title is required", 400);
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

    // Create task
    const task = new Task({
      room: roomId,
      title,
      description,
      status: "available",
      priority: priority || "medium",
      createdBy: req.user?.id,
      dueDate,
      estimatedHours,
      tags: tags || [],
      watchers: [req.user?.id],
    });

    await task.save();

    // Update room task count
    room.taskCount = (room.taskCount || 0) + 1;
    room.lastActivity = new Date();
    await room.save();

    await task.populate("createdBy", "username displayName avatar");
    await task.populate("assignedTo", "username displayName avatar");

    logger.success(`Task created: ${title} in room ${roomId}`);

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// GET ROOM TASKS
export const getRoomTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId } = req.params;
    const { status, assignedTo, priority, sortBy } = req.query;

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

    // Build filter
    const filter: any = { room: roomId };

    if (status) {
      filter.status = status;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (priority) {
      filter.priority = priority;
    }

    // Build sort
    let sort: any = { createdAt: -1 };
    if (sortBy === "priority") {
      const priorityOrder = { urgent: 1, high: 2, medium: 3, low: 4 };
      sort = { priority: 1, createdAt: -1 };
    } else if (sortBy === "dueDate") {
      sort = { dueDate: 1 };
    } else if (sortBy === "status") {
      sort = { status: 1, createdAt: -1 };
    }

    const tasks = await Task.find(filter)
      .populate("createdBy", "username displayName avatar")
      .populate("assignedTo", "username displayName avatar")
      .populate("watchers", "username displayName avatar")
      .sort(sort);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// GET TASK BY ID
export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id)
      .populate("createdBy", "username displayName avatar")
      .populate("assignedTo", "username displayName avatar")
      .populate("watchers", "username displayName avatar")
      .populate("comments.user", "username displayName avatar");

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK
export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      estimatedHours,
      tags,
    } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    // Update fields
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (estimatedHours !== undefined) task.estimatedHours = estimatedHours;
    if (tags !== undefined) task.tags = tags;

    if (status !== undefined) {
      task.status = status;
      if (status === "completed") {
        task.completedAt = new Date();
      }
    }

    task.version = (task.version || 0) + 1;
    await task.save();

    // Update room activity
    room.lastActivity = new Date();
    await room.save();

    await task.populate("createdBy", "username displayName avatar");
    await task.populate("assignedTo", "username displayName avatar");
    await task.populate("watchers", "username displayName avatar");

    logger.success(`Task updated: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE TASK
export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is the creator or room owner
    const room = await Room.findById(task.room);
    if (!room) {
      throw new AppError("Room not found", 404);
    }

    const isCreator = task.createdBy.toString() === req.user?.id;
    const isOwner = room.owner.toString() === req.user?.id;

    if (!isCreator && !isOwner) {
      throw new AppError(
        "Only the task creator or room owner can delete this task",
        403
      );
    }

    await Task.findByIdAndDelete(id);

    // Update room task count
    if (room.taskCount > 0) {
      room.taskCount = room.taskCount - 1;
    }
    await room.save();

    logger.success(`Task deleted: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// CLAIM TASK
export const claimTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    // Check if task is available
    if (task.status !== "available" && task.status !== "claimed") {
      throw new AppError("Task is not available for claiming", 400);
    }

    // Check if already claimed by someone else
    if (task.assignedTo && task.assignedTo.toString() !== req.user?.id) {
      throw new AppError("Task is already claimed by another user", 400);
    }

    // Claim task
    task.assignedTo = req.user?.id as any;
    task.status = "claimed";
    task.claimedAt = new Date();
    task.version = (task.version || 0) + 1;

    await task.save();

    // Update room activity
    room.lastActivity = new Date();
    await room.save();

    await task.populate("assignedTo", "username displayName avatar");
    await task.populate("createdBy", "username displayName avatar");

    logger.success(`Task claimed: ${task.title} by user ${req.user?.id}`);

    res.status(200).json({
      success: true,
      message: "Task claimed successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// UNCLAIM TASK
export const unclaimTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if task is claimed by the user
    if (!task.assignedTo || task.assignedTo.toString() !== req.user?.id) {
      throw new AppError("You haven't claimed this task", 400);
    }

    // Check if task can be unclaimed (not completed or cancelled)
    if (task.status === "completed" || task.status === "cancelled") {
      throw new AppError("Cannot unclaim a completed or cancelled task", 400);
    }

    // Unclaim task
    task.assignedTo = undefined;
    task.status = "available";
    task.claimedAt = undefined;
    task.version = (task.version || 0) + 1;

    await task.save();

    // Update room activity
    const room = await Room.findById(task.room);
    if (room) {
      room.lastActivity = new Date();
      await room.save();
    }

    await task.populate("createdBy", "username displayName avatar");

    logger.success(`Task unclaimed: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Task unclaimed successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ADD COMMENT TO TASK
export const addComment = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    if (!text || text.trim().length === 0) {
      throw new AppError("Comment text is required", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    // Add comment
    task.comments.push({
      user: req.user?.id as any,
      text: text.trim(),
      createdAt: new Date(),
    });

    await task.save();

    // Update room activity
    room.lastActivity = new Date();
    await room.save();

    await task.populate("comments.user", "username displayName avatar");

    logger.success(`Comment added to task: ${task.title}`);

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE CHECKLIST
export const updateChecklist = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { checklist } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    if (!Array.isArray(checklist)) {
      throw new AppError("Checklist must be an array", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    // Update checklist
    task.checklist = checklist.map((item: any) => ({
      text: item.text,
      completed: item.completed || false,
      completedBy: item.completed
        ? req.user?.id as any
        : undefined,
      completedAt: item.completed ? new Date() : undefined,
    }));

    await task.save();

    logger.success(`Checklist updated for task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Checklist updated successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// ADD WATCHER
export const addWatcher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Check if user is a member of the room
    const room = await Room.findById(task.room);
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

    // Check if already watching
    if (task.watchers.some((watcher) => watcher.toString() === req.user?.id)) {
      throw new AppError("You are already watching this task", 400);
    }

    // Add watcher
    task.watchers.push(req.user?.id as any);
    await task.save();

    await task.populate("watchers", "username displayName avatar");

    logger.success(`Watcher added to task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Added as watcher successfully",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// REMOVE WATCHER
export const removeWatcher = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      throw new AppError("Invalid task ID", 400);
    }

    const task = await Task.findById(id);

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    // Find and remove watcher
    const watcherIndex = task.watchers.findIndex(
      (watcher) => watcher.toString() === req.user?.id
    );

    if (watcherIndex === -1) {
      throw new AppError("You are not watching this task", 400);
    }

    task.watchers.splice(watcherIndex, 1);
    await task.save();

    logger.success(`Watcher removed from task: ${task.title}`);

    res.status(200).json({
      success: true,
      message: "Removed as watcher successfully",
    });
  } catch (error) {
    next(error);
  }
};
