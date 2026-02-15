"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TaskAssignmentDialog } from "@/components/task-assignment-dialog";
import { 
  Plus, 
  User, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Circle,
  Loader2,
  Users,
  ChevronRight,
  Sparkles,
  Zap,
  Target,
  Trophy
} from "lucide-react";
import { toast } from "sonner";
import { getRoomTasks, Task, createTask, updateTask } from "@/services/taskServices";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface TaskColumn {
  id: string;
  title: string;
  status: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function RoomTaskBoardPage() {
  const params = useParams();
  const roomId = params.id as string;

  const [tasks,setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [creating, setCreating] = useState(false);

  const columns: TaskColumn[] = [
    {
      id: "available",
      title: "Available",
      status: "available",
      icon: <Circle className="h-4 w-4" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-900/50"
    },
    {
      id: "claimed",
      title: "Claimed",
      status: "claimed",
      icon: <User className="h-4 w-4" />,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      id: "in-progress",
      title: "In Progress",
      status: "in-progress",
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20"
    },
    {
      id: "review",
      title: "Review",
      status: "review",
      icon: <AlertCircle className="h-4 w-4" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      id: "completed",
      title: "Completed",
      status: "completed",
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    }
  ];

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    dueDate: "",
    estimatedHours: "",
    tags: "",
    assignedTo: ""
  });

  useEffect(() => {
    fetchTasks();
  }, [roomId]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await getRoomTasks(roomId);
      if (response.success) {
        setTasks(response.tasks);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    setCreating(true);
    try {
      const taskData: any = {
        title: newTask.title,
        description: newTask.description || undefined,
        priority: newTask.priority,
        tags: newTask.tags ? newTask.tags.split(",").map(t => t.trim()) : undefined,
      };

      if (newTask.dueDate) {
        taskData.dueDate = newTask.dueDate;
      }

      if (newTask.estimatedHours) {
        taskData.estimatedHours = parseFloat(newTask.estimatedHours);
      }

      if (newTask.assignedTo) {
        taskData.assignedTo = newTask.assignedTo;
      }

      const response = await createTask(roomId, taskData);
      
      if (response.success) {
        toast.success("Task created successfully! 🎯", {
          description: newTask.assignedTo 
            ? "Team member has been notified" 
            : "Task is now available for the team",
        });
        setTasks([...tasks, response.task]);
        setCreateDialogOpen(false);
        resetNewTask();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const resetNewTask = () => {
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
      estimatedHours: "",
      tags: "",
      assignedTo: ""
    });
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const response = await updateTask(taskId, { status: newStatus });
      if (response.success) {
        setTasks(tasks.map(t => t._id === taskId ? response.task : t));
        toast.success("Task status updated! ✨");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update task");
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "high":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
      case "low":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Zap className="h-3 w-3" />;
      case "high":
        return <AlertCircle className="h-3 w-3" />;
      case "medium":
        return <Target className="h-3 w-3" />;
      case "low":
        return <Circle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAssignClick = (task: Task) => {
    setSelectedTask(task);
    setAssignDialogOpen(true);
  };

  const handleTaskAssigned = (assignee: any) => {
    if (selectedTask) {
      setTasks(tasks.map(t => 
        t._id === selectedTask._id 
          ? { ...t, assignedTo: assignee, status: assignee ? "claimed" : "available" }
          : t
      ));
    }
    setSelectedTask(null);
  };

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress" || t.status === "review").length,
    available: tasks.filter(t => t.status === "available").length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header with Stats */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Task Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Collaborate and track progress together
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Create New Task
              </DialogTitle>
              <DialogDescription>
                Add a new task to your room's board. Assign it to someone or leave it available for anyone to claim.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="What needs to be done?"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add more details..."
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="estimatedHours">Est. Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    placeholder="0"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="frontend, bug, urgent"
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Task
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <Target className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold">{stats.inProgress}</p>
            </div>
            <Loader2 className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">{completionRate}%</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 auto-rows-fr">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.status);
          
          return (
            <Card key={column.id} className={cn("flex flex-col", column.bgColor)}>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={column.color}>
                      {column.icon}
                    </div>
                    <h3 className="font-semibold">{column.title}</h3>
                  </div>
                  <Badge variant="secondary" className="rounded-full">
                    {columnTasks.length}
                  </Badge>
                </div>
              </div>

              <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[600px]">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Circle className="h-8 w-8 mb-2 opacity-20" />
                    <p className="text-sm">No tasks</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <Card
                      key={task._id}
                      className="p-3 hover:shadow-md transition-all cursor-pointer group"
                    >
                      <div className="space-y-3">
                        {/* Title and Priority */}
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-2 flex-1">
                            {task.title}
                          </h4>
                          <Badge
                            variant="outline"
                            className={cn("text-xs gap-1 shrink-0", getPriorityColor(task.priority))}
                          >
                            {getPriorityIcon(task.priority)}
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Description */}
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {task.tags.slice(0, 3).map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs px-2 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          {task.assignedTo ? (
                            <button
                              onClick={() => handleAssignClick(task)}
                              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                            >
                              <Avatar className="h-6 w-6">
                                <AvatarImage src={task.assignedTo.avatar} />
                                <AvatarFallback className="text-xs">
                                  {getInitials(task.assignedTo.displayName || task.assignedTo.username)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">
                                {task.assignedTo.displayName || task.assignedTo.username}
                              </span>
                            </button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAssignClick(task)}
                            >
                              <Users className="h-3 w-3 mr-1" />
                              Assign
                            </Button>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          )}
                        </div>

                        {/* Status Change Actions */}
                        {task.status !== "completed" && task.status !== "cancelled" && (
                          <div className="pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                           <Select
                              value={task.status}
                              onValueChange={(value) => handleStatusChange(task._id, value)}
                            >
                              <SelectTrigger className="h-7 text-xs">
                                <SelectValue placeholder="Move to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {columns
                                  .filter(c => c.status !== task.status && c.status !== "cancelled")
                                  .map(c => (
                                    <SelectItem key={c.id} value={c.status} className="text-xs">
                                      <div className="flex items-center gap-2">
                                        {c.icon}
                                        {c.title}
                                      </div>
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Task Assignment Dialog */}
      {selectedTask && (
        <TaskAssignmentDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          taskId={selectedTask._id}
          roomId={roomId}
          currentAssignee={selectedTask.assignedTo}
          onAssigned={handleTaskAssigned}
        />
      )}
    </div>
  );
}
