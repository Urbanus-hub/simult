"use client";

import * as React from "react";
import { Send, Mail, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSearch, User } from "@/components/user-search";
import { sendInvitation } from "@/services/roomServices";
import { Textarea } from "@/components/ui/textarea";

interface InviteDialogProps {
  roomId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function InviteDialog({
  roomId,
  open,
  onOpenChange,
  trigger,
}: InviteDialogProps) {
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleInviteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await sendInvitation(roomId, selectedUser.email, message);
      toast.success(`Invitation sent to ${selectedUser.displayName}`);
      onOpenChange?.(false);
      setSelectedUser(null);
      setMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleInviteEmail = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await sendInvitation(roomId, email, message);
      toast.success(`Invitation sent to ${email}`);
      onOpenChange?.(false);
      setEmail("");
      setMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite to Room</DialogTitle>
          <DialogDescription>
            Invite teammates to collaborate in this room.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="user">Search User</TabsTrigger>
            <TabsTrigger value="email">By Email</TabsTrigger>
          </TabsList>

          <TabsContent value="user" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Search User</Label>
              <UserSearch onSelect={setSelectedUser} />
              {selectedUser && (
                <div className="text-sm text-green-600 flex items-center gap-2 mt-2">
                  <UserPlus className="h-4 w-4" />
                  Selected: {selectedUser.displayName}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Personal Message (Optional)</Label>
              <Textarea
                placeholder="Join me in this room..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button
              onClick={handleInviteUser}
              className="w-full"
              disabled={!selectedUser || loading}
            >
              {loading && <UserPlus className="mr-2 h-4 w-4 animate-spin" />}
              {!loading && <Send className="mr-2 h-4 w-4" />}
              Send Invitation
            </Button>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                placeholder="colleague@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Personal Message (Optional)</Label>
              <Textarea
                placeholder="Join me in this room..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <Button
              onClick={handleInviteEmail}
              className="w-full"
              disabled={!email || loading}
            >
              {loading && <Mail className="mr-2 h-4 w-4 animate-spin" />}
              {!loading && <Send className="mr-2 h-4 w-4" />}
              Send Email Invite
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
