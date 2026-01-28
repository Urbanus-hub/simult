"use client";

import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Page() {
  const { user } = useAuth();

  // Mock data for dashboard
  const stats = [
    {
      title: "Active Tasks",
      value: "12",
      description: "2 due today",
      icon: CheckCircle2,
      color: "text-blue-500",
    },
    {
      title: "Pending Invites",
      value: "3",
      description: "Needs response",
      icon: Users,
      color: "text-orange-500",
    },
    {
      title: "Unread Messages",
      value: "5",
      description: "From 2 chats",
      icon: MessageSquare,
      color: "text-green-500",
    },
  ];

  const recentActivity = [
    {
      user: "Alice Johnson",
      action: "commented on",
      target: "Homepage Redesign",
      time: "2 mins ago",
      avatar: "/avatars/alice.jpg",
    },
    {
      user: "System",
      action: "created room",
      target: "Project Alpha",
      time: "1 hour ago",
      avatar: "",
      initials: "SY",
    },
    {
      user: "Bob Smith",
      action: "completed task",
      target: "Update dependencies",
      time: "3 hours ago",
      avatar: "/avatars/bob.jpg",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back,{" "}
            {user?.displayName || user?.username || "Collaborator"}. Here's
            what's happening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/tasks">
              <Plus className="mr-2 h-4 w-4" /> New Task
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/rooms/create">
              <Plus className="mr-2 h-4 w-4" /> New Room
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your rooms and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={activity.avatar} alt={activity.user} />
                    <AvatarFallback>
                      {activity.initials || activity.user.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.user}
                      <span className="font-normal text-muted-foreground">
                        {" "}
                        {activity.action}{" "}
                      </span>
                      {activity.target}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Schedule/Upcoming */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming</CardTitle>
            <CardDescription>Your schedule for the day.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Team Sync</p>
                  <p className="text-xs text-muted-foreground">
                    10:00 AM - 11:00 AM • Room Alpha
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border bg-muted">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Deadline: Q3 Report
                  </p>
                  <p className="text-xs text-muted-foreground">
                    5:00 PM • Tasks
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
