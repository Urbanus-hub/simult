import { api } from "@/lib/api";

export interface Task {
  _id: string;
  room: string;
  title: string;
  description?: string;
  status:
    | "available"
    | "claimed"
    | "in-progress"
    | "review"
    | "completed"
    | "cancelled";
  assignedTo?: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  priority: "low" | "medium" | "high" | "urgent";
  tags: string[];
  createdBy: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  dueDate?: string;
  estimatedHours?: number;
  watchers: Array<{
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  }>;
  comments: Array<{
    user: {
      _id: string;
      username: string;
      displayName?: string;
      avatar?: string;
    };
    text: string;
    createdAt: string;
  }>;
  checklist: Array<{
    text: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
  assignedTo?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
}

// Create a new task
export async function createTask(roomId: string, data: CreateTaskData) {
  const response = await api.post(`/rooms/${roomId}/tasks`, data);
  return response.data;
}

// Get tasks for a room
export async function getRoomTasks(
  roomId: string,
  filters?: {
    status?: string;
    assignedTo?: string;
    priority?: string;
    sortBy?: string;
  },
) {
  const params = new URLSearchParams();
  if (filters?.status) params.append("status", filters.status);
  if (filters?.assignedTo) params.append("assignedTo", filters.assignedTo);
  if (filters?.priority) params.append("priority", filters.priority);
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);

  const url = `/rooms/${roomId}/tasks${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await api.get(url);
  return response.data;
}

// Get a single task by ID
export async function getTaskById(taskId: string) {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

// Update a task
export async function updateTask(taskId: string, data: UpdateTaskData) {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
}

// Delete a task
export async function deleteTask(taskId: string) {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

// Claim a task
export async function claimTask(taskId: string) {
  const response = await api.post(`/tasks/${taskId}/claim`);
  return response.data;
}

// Unclaim a task
export async function unclaimTask(taskId: string) {
  const response = await api.post(`/tasks/${taskId}/unclaim`);
  return response.data;
}

// Assign a task to a user
export async function assignTask(taskId: string, assigneeId: string) {
  const response = await api.post(`/tasks/${taskId}/assign`, { assigneeId });
  return response.data;
}

// Unassign a task
export async function unassignTask(taskId: string) {
  const response = await api.post(`/tasks/${taskId}/unassign`);
  return response.data;
}

// Add a comment to a task
export async function addTaskComment(taskId: string, text: string) {
  const response = await api.post(`/tasks/${taskId}/comments`, { text });
  return response.data;
}

// Update checklist
export async function updateTaskChecklist(
  taskId: string,
  checklist: Array<{ text: string; completed: boolean }>,
) {
  const response = await api.put(`/tasks/${taskId}/checklist`, { checklist });
  return response.data;
}

// Add watcher
export async function addTaskWatcher(taskId: string) {
  const response = await api.post(`/tasks/${taskId}/watch`);
  return response.data;
}

// Remove watcher
export async function removeTaskWatcher(taskId: string) {
  const response = await api.delete(`/tasks/${taskId}/watch`);
  return response.data;
}
