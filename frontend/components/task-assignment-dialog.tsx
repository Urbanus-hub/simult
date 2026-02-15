"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, UserPlus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface User {
  _id: string;
  username: string;
  displayName?: string;
  avatar?: string;
  email?: string;
  status?: string;
}

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  roomId: string;
  currentAssignee?: User;
  onAssigned?: (assignee: User) => void;
}

export function TaskAssignmentDialog({
  open,
  onOpenChange,
  taskId,
  roomId,
  currentAssignee,
  onAssigned,
}: TaskAssignmentDialogProps) {
  const [members, setMembers] = useState<User[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchRoomMembers();
    }
  }, [open, roomId]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = members.filter(
        (member) =>
          member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          member.displayName
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          member.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchQuery, members]);

  const fetchRoomMembers = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/rooms/${roomId}`);
      if (response.data.success) {
        setMembers(response.data.room.members || []);
        setFilteredMembers(response.data.room.members || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load room members",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (userId: string) => {
    setAssigning(true);
    try {
      const response = await api.post(`/tasks/${taskId}/assign`, {
        assigneeId: userId,
      });

      if (response.data.success) {
        const assignedMember = members.find((m) => m._id === userId);
        toast.success(
          `Task assigned to ${assignedMember?.displayName || assignedMember?.username}`,
          {
            description: "They'll receive a notification",
            icon: "🎯",
          },
        );
        onAssigned?.(assignedMember!);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign task");
    } finally {
      setAssigning(false);
    }
  };

  const handleUnassign = async () => {
    setAssigning(true);
    try {
      const response = await api.post(`/tasks/${taskId}/unassign`);

      if (response.data.success) {
        toast.success("Task unassigned", {
          description: "Task is now available for anyone to claim",
        });
        onAssigned?.(null as any);
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to unassign task");
    } finally {
      setAssigning(false);
    }
  };

  const getInitials = (user: User) => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.username.slice(0, 2).toUpperCase();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "busy":
        return "bg-red-500";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Task
          </DialogTitle>
          <DialogDescription>
            {currentAssignee
              ? "Reassign this task to another team member"
              : "Choose a team member to assign this task to"}
          </DialogDescription>
        </DialogHeader>

        {currentAssignee && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentAssignee.avatar} />
                <AvatarFallback>{getInitials(currentAssignee)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {currentAssignee.displayName || currentAssignee.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  Currently assigned
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUnassign}
              disabled={assigning}
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {filteredMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No members found
                  </p>
                ) : (
                  filteredMembers.map((member) => (
                    <button
                      key={member._id}
                      onClick={() => handleAssign(member._id)}
                      disabled={
                        assigning || member._id === currentAssignee?._id
                      }
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
                    >
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{getInitials(member)}</AvatarFallback>
                        </Avatar>
                        {member.status && (
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {member.displayName || member.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{member.username}
                        </p>
                      </div>
                      {member._id === currentAssignee?._id && (
                        <Badge variant="secondary" className="shrink-0">
                          Current
                        </Badge>
                      )}
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={assigning}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
