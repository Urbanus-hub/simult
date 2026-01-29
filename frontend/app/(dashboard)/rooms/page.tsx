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

export default function RoomsPage() {
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
        {/* Mock Room Card 1 */}
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">Engineering Team</CardTitle>
                <CardDescription className="line-clamp-2">
                  Daily standups and sprint planning for the frontend overhaul.
                </CardDescription>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <IconLock className="h-3 w-3" />
                Private
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="border-t bg-muted/20 px-6 py-3">
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconUsers className="h-3 w-3" />
                <span>12/50</span>
              </div>
              <span>Active 2m ago</span>
            </div>
          </CardFooter>
          <div className="px-6 pb-4">
            <InviteDialog
              roomId="mock-id"
              trigger={
                <Button variant="outline" size="sm" className="w-full">
                  Invite Members
                </Button>
              }
            />
          </div>
        </Card>

        {/* Mock Room Card 2 */}
        <Card className="flex flex-col">
          <CardHeader className="flex-1">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">General Discussion</CardTitle>
                <CardDescription className="line-clamp-2">
                  Watercooler chat and random sharing for the whole company.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="flex items-center gap-1">
                <IconWorld className="h-3 w-3" />
                Public
              </Badge>
            </div>
          </CardHeader>
          <CardFooter className="border-t bg-muted/20 px-6 py-3">
            <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <IconUsers className="h-3 w-3" />
                <span>128/500</span>
              </div>
              <span>Active 1h ago</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 ml-auto h-8 w-8"
            >
              <IconLogin className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {/* Mock Room Card 3 */}
        <Card className="flex flex-col border-dashed shadow-none">
          <Link
            href="/rooms/create"
            className="flex h-full flex-col items-center justify-center p-6 text-muted-foreground hover:text-foreground"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <IconPlus className="h-5 w-5" />
            </div>
            <span className="mt-4 text-sm font-medium">Create New Room</span>
          </Link>
        </Card>
      </div>
    </div>
  );
}
