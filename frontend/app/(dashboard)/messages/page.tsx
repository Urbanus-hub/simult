"use client";

import { useState } from "react";
import {
  IconSearch,
  IconMessagePlus,
  IconPhone,
  IconVideo,
  IconDotsVertical,
  IconSend,
  IconPaperclip,
  IconMoodSmile,
} from "@tabler/icons-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Mock Data
const conversations = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "/avatars/alice.jpg",
    lastMessage: "Can we schedule a call?",
    time: "10:30 AM",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Bob Smith",
    avatar: "/avatars/bob.jpg",
    lastMessage: "I'll send the files shortly.",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Design Team",
    avatar: "",
    initials: "DT",
    lastMessage: "Updated the figma components.",
    time: "Mon",
    unread: 0,
    online: true,
  }, // Group
];

const messages = [
  {
    id: 1,
    senderId: 2,
    text: "Hey! How's the project going?",
    time: "10:00 AM",
  },
  {
    id: 2,
    senderId: 0,
    text: "It's going well, just wrapping up the UI.",
    time: "10:05 AM",
  },
  {
    id: 3,
    senderId: 2,
    text: "Great, I'll send the files shortly.",
    time: "10:06 AM",
  },
];

export default function MessagesPage() {
  const [selectedId, setSelectedId] = useState<number | null>(2);
  const [inputText, setInputText] = useState("");

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-card">
      {/* Sidebar List */}
      <div className="w-80 shrink-0 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Messages</h2>
            <Button size="icon" variant="ghost">
              <IconMessagePlus className="h-5 w-5" />
            </Button>
          </div>
          <div className="relative">
            <IconSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search messages..." className="pl-9" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {conversations.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedId(chat.id)}
                className={cn(
                  "flex items-start gap-3 p-4 text-left transition-colors hover:bg-muted/50",
                  selectedId === chat.id && "bg-muted",
                )}
              >
                <div className="relative">
                  <Avatar>
                    <AvatarImage src={chat.avatar} />
                    <AvatarFallback>
                      {chat.initials || chat.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">{chat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {chat.time}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "text-sm truncate mt-1",
                      chat.unread > 0
                        ? "text-foreground font-medium"
                        : "text-muted-foreground",
                    )}
                  >
                    {chat.lastMessage}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background/50">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={selectedConversation.avatar} />
                  <AvatarFallback>
                    {selectedConversation.initials ||
                      selectedConversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedConversation.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.online ? "Online" : "Offline"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <IconPhone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <IconVideo className="h-5 w-5" />
                </Button>
                <Separator orientation="vertical" className="h-6 mx-1" />
                <Button variant="ghost" size="icon">
                  <IconDotsVertical className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isMe = msg.senderId === 0;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex w-max max-w-[75%] items-end gap-2",
                        isMe ? "ml-auto flex-row-reverse" : "",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 text-sm",
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none",
                        )}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mb-1">
                        {msg.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <IconPaperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="flex-1"
                />
                <Button variant="ghost" size="icon" className="shrink-0">
                  <IconMoodSmile className="h-5 w-5" />
                </Button>
                <Button size="icon" className="shrink-0">
                  <IconSend className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <IconMessagePlus className="h-16 w-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
