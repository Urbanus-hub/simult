"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconSearch,
  IconUsers,
  IconLock,
  IconWorld,
  IconDotsVertical,
  IconLogin,
} from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { InviteDialog } from "@/components/invite-dialog";
import { getRooms } from "@/services/roomServices";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface Room {
  _id: string;
  name: string;
  description?: string;
  isPrivate: boolean;
  members: string[]; // IDs
  maxMembers: number;
  lastActivity: string;
}

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await getRooms();
        if (res.success) {
          setRooms(res.rooms);
        }
      } catch (error) {
        console.error("Failed to fetch rooms", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Rooms</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your collaboration spaces
          </p>
        </div>
        <Button asChild>
          <Link href="/rooms/create">
            <IconPlus className="mr-2 h-4 w-4" />
            Create Room
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms..."
            className="pl-9 bg-background"
          />
        </div>
        <Select defaultValue="active">
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
            <SelectItem value="all">All Rooms</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading && (
          <div className="col-span-full text-center text-muted-foreground p-10">
            Loading rooms...
          </div>
        )}

        {!loading && rooms.length === 0 && (
          <div className="col-span-full text-center py-10">
            <h3 className="text-lg font-medium">No rooms yet</h3>
            <p className="text-muted-foreground">
              Create your first room to get started.
            </p>
          </div>
        )}

        {rooms.map((room) => (
          <Card key={room._id} className="flex flex-col">
            <CardHeader className="flex-1">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base truncate">
                    {room.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {room.description || "No description provided."}
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="flex items-center gap-1 shrink-0"
                >
                  {room.isPrivate ? (
                    <IconLock className="h-3 w-3" />
                  ) : (
                    <IconWorld className="h-3 w-3" />
                  )}
                  {room.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>
            </CardHeader>
            <CardFooter className="border-t bg-muted/20 px-6 py-3">
              <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <IconUsers className="h-3 w-3" />
                  <span>
                    {room.members.length}/{room.maxMembers}
                  </span>
                </div>
                <span>
                  Active {formatDistanceToNow(new Date(room.lastActivity))} ago
                </span>
              </div>
            </CardFooter>
            <div className="px-6 pb-4 flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/messages/rooms?roomId=${room._id}`}>
                  <IconLogin className="h-4 w-4 mr-2" />
                  Chat
                </Link>
              </Button>
              <InviteDialog
                roomId={room._id}
                trigger={
                  <Button variant="outline" size="sm" className="flex-1">
                    Invite
                  </Button>
                }
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
