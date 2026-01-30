"use client";

import * as React from "react";
import {
  Send,
  Image as ImageIcon,
  Paperclip,
  MoreVertical,
  Search,
  Phone,
  Video,
} from "lucide-react";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext";
import {
  getRoomMessages,
  getDirectMessages,
  sendMessage,
} from "@/services/messageServices";

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  createdAt: string;
  contentType: "text" | "file" | "image" | "system";
}

interface ChatAreaProps {
  type: "room" | "direct";
  id: string; // roomId or userId
  name: string;
  avatar?: string;
  status?: string;
}

export function ChatArea({ type, id, name, avatar, status }: ChatAreaProps) {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  // Fetch initial messages
  React.useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        let res;
        if (type === "room") {
          res = await getRoomMessages(id);
        } else {
          res = await getDirectMessages(id);
        }

        if (res.success) {
          // Ensure messages are sorted chronologically
          setMessages(res.messages.reverse());
        }
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMessages();
    }
  }, [type, id]);

  // Socket listeners
  React.useEffect(() => {
    if (!socket) return;

    // Join room
    if (type === "room") {
      socket.emit("join_room", id);
    }

    const handleNewMessage = (message: Message) => {
      // Verify message belongs to this chat
      if (type === "room" && (message as any).room === id) {
        setMessages((prev) => [...prev, message]);
      } else if (
        type === "direct" &&
        (message.sender._id === id || // Message from them to me
          (message.sender._id === user?.id &&
            (message as any).recipient === id))
      ) {
        // Message from me to them (should be handled by optimistic UI, but good for sync)

        // Check if we already have it (optimistic update)
        setMessages((prev) => {
          if (prev.find((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      if (type === "room") {
        socket.emit("leave_room", id);
      }
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, type, id, user]);

  // Scroll to bottom
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const tempId = Date.now().toString();
    const content = inputText;
    setInputText("");

    // Optimistic update
    const optimisticMessage: Message = {
      _id: tempId,
      content,
      sender: {
        _id: user?.id || "",
        username: user?.username || "",
        displayName: user?.displayName,
        avatar: user?.avatar,
      },
      createdAt: new Date().toISOString(),
      contentType: "text",
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const payload = {
        messageType: type,
        content,
        ...(type === "room" ? { room: id } : { recipient: id }),
      };

      const res = await sendMessage(payload);
      if (res.success) {
        setMessages((prev) => {
          // Check if real message already exists (from socket)
          if (prev.some((m) => m._id === res.message._id)) {
            // Remove optimistic
            return prev.filter((m) => m._id !== tempId);
          }
          // Swap optimistic
          return prev.map((msg) => (msg._id === tempId ? res.message : msg));
        });
      }
    } catch (error) {
      console.error("Failed to send", error);
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{name}</h3>
            {status && (
              <p className="text-xs text-muted-foreground">{status}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {loading && (
            <div className="flex justify-center p-4">
              <span className="text-xs text-muted-foreground animate-pulse">
                Loading messages...
              </span>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 text-muted-foreground">
              <p>No messages yet.</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.sender._id === user?.id;
            const showAvatar =
              !isMe &&
              (index === 0 ||
                messages[index - 1].sender._id !== msg.sender._id);

            return (
              <div
                key={msg._id}
                className={cn("flex gap-2 max-w-[80%]", isMe ? "ml-auto" : "")}
              >
                {!isMe && (
                  <div className="w-8 shrink-0">
                    {showAvatar && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={msg.sender.avatar} />
                        <AvatarFallback>
                          {msg.sender.username.substring(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2 text-sm",
                    isMe
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted rounded-tl-none",
                  )}
                >
                  {!isMe && showAvatar && (
                    <p className="text-[10px] opacity-70 mb-1 font-semibold">
                      {msg.sender.displayName || msg.sender.username}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[10px] opacity-50 block text-right mt-1">
                    {format(new Date(msg.createdAt), "h:mm a")}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-end gap-2">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ImageIcon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-5 w-5" />
            </Button>
          </div>
          <Input
            className="flex-1 bg-muted/50 border-0 focus-visible:ring-1 min-h-[44px]"
            placeholder={`Message ${name}...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
