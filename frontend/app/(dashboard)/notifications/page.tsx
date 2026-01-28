"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { IconBell, IconMessage, IconUserPlus } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: "message",
      title: "New message from Alice",
      description: "Hey, can you review the new designs?",
      time: "2m ago",
      read: false,
    },
    {
      id: 2,
      type: "invite",
      title: "Room Invitation",
      description: "John invited you to 'Project Alpha'",
      time: "1h ago",
      read: true,
    },
    {
      id: 3,
      type: "system",
      title: "System Update",
      description: "Simult has been updated to version 1.2.0",
      time: "1d ago",
      read: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Notifications
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with what's happening.
          </p>
        </div>
        <Badge variant="secondary">
          {notifications.filter((n) => !n.read).length} New
        </Badge>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`flex items-start p-4 hover:bg-muted/50 transition-colors ${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}
          >
            <div className="mr-4 mt-1 rounded-full bg-background p-2 ring-1 ring-border">
              {notification.type === "message" && (
                <IconMessage className="h-5 w-5 text-blue-500" />
              )}
              {notification.type === "invite" && (
                <IconUserPlus className="h-5 w-5 text-green-500" />
              )}
              {notification.type === "system" && (
                <IconBell className="h-5 w-5 text-zinc-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium leading-none">
                  {notification.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {notification.time}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {notification.description}
              </p>
            </div>
            {!notification.read && (
              <div className="ml-4 h-2 w-2 rounded-full bg-primary self-center" />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
