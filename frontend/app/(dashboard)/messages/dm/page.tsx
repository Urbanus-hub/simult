"use client";

import * as React from "react";
import { useEffect } from "react";
// We need an endpoint to get recent DMs or all users.
// Assuming we have a recent updates endpoint or we can search users.
// For now, let's implement a way to start a new chat via search + list active chats (mocked or need API).
import { searchUsers } from "@/services/userServices";
import { ChatArea } from "@/components/chat-area";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getConversations } from "@/services/messageServices";
import { UserSearch } from "@/components/user-search";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock or Real type
interface DMUser {
  _id: string;
  username: string;
  displayName: string;
  avatar?: string;
  lastMessage?: string;
  lastActive?: string;
}

export default function DirectMessagesPage() {
  // In a real app, successful DMs would be fetched from backend
  // const [users, setUsers] = React.useState<DMUser[]>([])
  // State to hold "active" conversations locally for now
  const [conversations, setConversations] = React.useState<DMUser[]>([]);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null,
  );
  const [loading, setLoading] = React.useState(true); // Set to true when implementing fetch
  const [dialogOpen, setDialogOpen] = React.useState(false);

  useEffect(() => {
    async function loadConversations() {
      try {
        const data = await getConversations();
        if (data && data.conversations) {
          const mapped = data.conversations.map((c: any) => ({
            _id: c.user._id,
            username: c.user.username,
            displayName: c.user.displayName,
            avatar: c.user.avatar,
            lastMessage: c.lastMessage?.content || "No messages",
            // unreadCount: c.unreadCount
          }));
          setConversations(mapped);
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  const selectedUser = conversations.find((u) => u._id === selectedUserId);

  const handleStartChat = (user: any) => {
    // user from search is { id, username, email, ... }
    // map to DMUser
    const existing = conversations.find((c) => c._id === user.id);
    if (existing) {
      setSelectedUserId(existing._id);
    } else {
      const newUser: DMUser = {
        _id: user.id,
        username: user.username,
        displayName: user.displayName || user.username,
        avatar: user.avatar,
        lastMessage: "New conversation",
      };
      setConversations((prev) => [newUser, ...prev]);
      setSelectedUserId(newUser._id);
    }
    setDialogOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* Sidebar List */}
      <div className="w-80 border-r flex flex-col bg-muted/10">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" /> Direct Messages
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Message</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <label className="text-sm font-medium mb-2 block">To:</label>
                <UserSearch onSelect={handleStartChat} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <p>No conversations yet.</p>
                <Button
                  variant="link"
                  onClick={() => setDialogOpen(true)}
                  className="mt-2 h-auto p-0"
                >
                  Start a chat
                </Button>
              </div>
            )}
            {conversations.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUserId(user._id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm hover:bg-accent",
                  selectedUserId === user._id ? "bg-accent" : "",
                )}
              >
                <Avatar className="h-10 w-10 border bg-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                  <div className="font-medium truncate">{user.displayName}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.lastMessage}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUserId && selectedUser ? (
          <ChatArea
            type="direct"
            id={selectedUserId}
            name={selectedUser.displayName}
            avatar={selectedUser.avatar}
            status={selectedUser.username}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center space-y-2">
              <MessageCircle className="h-12 w-12 mx-auto opacity-20" />
              <p>Select a conversation or start a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
