"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Settings, 
  MessageSquare, 
  ListTodo, 
  UserPlus, 
  Calendar,
  Shield,
  Clock,
  Loader2,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import Link from "next/link";
import { InviteDialog } from "@/components/invite-dialog";
import { formatDistanceToNow } from "date-fns";

interface Room {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  owner: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  members: Array<{
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
    status?: string;
  }>;
  maxMembers: number;
  taskCount?: number;
  messageCount?: number;
  lastActivity: string;
  createdAt: string;
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [roomId]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/rooms/${roomId}`);
      if (response.data.success) {
        setRoom(response.data.room);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load room details");
      router.push("/rooms");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!room) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/rooms")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{room.name}</h1>
              <Badge variant={room.isPrivate ? "secondary" : "outline"}>
                {room.isPrivate ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Private
                  </>
                ) : (
                  "Public"
                )}
              </Badge>
            </div>
            {room.description && (
              <p className="text-muted-foreground mt-1">{room.description}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>
                  {room.members.length}/{room.maxMembers} members
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  Active {formatDistanceToNow(new Date(room.lastActivity), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <Button onClick={() => setInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Members
        </Button>
      </div>

      <Separator />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.members.length}</div>
            <p className="text-xs text-muted-foreground">
              of {room.maxMembers} max
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.taskCount || 0}</div>
            <Link 
              href={`/rooms/${roomId}/tasks`}
              className="text-xs text-primary hover:underline"
            >
              View task board →
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{room.messageCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              total messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="h-4 w-4 mr-2" />
            Tasks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Room Information</CardTitle>
              <CardDescription>
                Details about this collaboration space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1">Owner</h4>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={room.owner.avatar} />
                    <AvatarFallback>
                      {getInitials(room.owner.displayName || room.owner.username)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {room.owner.displayName || room.owner.username}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Created</h4>
                <p className="text-sm text-muted-foreground">
                  {new Date(room.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1">Privacy</h4>
                <p className="text-sm text-muted-foreground">
                  {room.isPrivate
                    ? "This is a private room. Only invited members can join."
                    : "This is a public room. Anyone can join."}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members ({room.members.length})</CardTitle>
              <CardDescription>
                People collaborating in this room
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {room.members.map((member) => (
                  <div
                    key={member._id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>
                            {getInitials(member.displayName || member.username)}
                          </AvatarFallback>
                        </Avatar>
                        {member.status && (
                          <span
                            className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {member.displayName || member.username}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{member.username}
                        </p>
                      </div>
                    </div>
                    {member._id === room.owner._id && (
                      <Badge variant="secondary">Owner</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Task Management</CardTitle>
              <CardDescription>
                View and manage tasks for this room
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <ListTodo className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Go to Task Board</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                Create, assign, and track tasks with your team on the interactive task board.
              </p>
              <Button asChild size="lg">
                <Link href={`/rooms/${roomId}/tasks`}>
                  <ListTodo className="mr-2 h-4 w-4" />
                  Open Task Board
                </Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <InviteDialog
        open={inviteDialogOpen}
        onOpenChange={setInviteDialogOpen}
        roomId={roomId}
      />
    </div>
  );
}
