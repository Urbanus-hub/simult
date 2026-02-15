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
  Info,
  Sparkles,
} from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
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

// Helper to format date separators
const formatDateSeparator = (date: Date): string => {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "MMMM d, yyyy");
};

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
          // Backend already returns messages in chronological order (oldest first)
          setMessages(res.messages);
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
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="text-sm font-semibold">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base">{name}</h3>
            {status && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                {status}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted"
            title="Voice call"
          >
            <Phone className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted"
            title="Video call"
          >
            <Video className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted"
            title="Search messages"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted"
            title="More options"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4">
        <div className="flex flex-col gap-1">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                <span className="text-sm">Loading messages...</span>
              </div>
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted/50 p-6 mb-4">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No messages yet</h3>
              <p className="text-sm text-muted-foreground">
                Start the conversation by sending a message!
              </p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.sender._id === user?.id;
            const isSystem = msg.contentType === "system";
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const nextMsg =
              index < messages.length - 1 ? messages[index + 1] : null;

            // Check if we need a date separator
            const showDateSeparator =
              !prevMsg ||
              !isSameDay(new Date(msg.createdAt), new Date(prevMsg.createdAt));

            // Check if this is a new message group (different sender or time gap)
            const isNewGroup =
              !prevMsg ||
              prevMsg.sender._id !== msg.sender._id ||
              prevMsg.contentType !== msg.contentType ||
              new Date(msg.createdAt).getTime() -
                new Date(prevMsg.createdAt).getTime() >
                5 * 60 * 1000; // 5 min gap

            const isLastInGroup =
              !nextMsg ||
              nextMsg.sender._id !== msg.sender._id ||
              nextMsg.contentType !== msg.contentType ||
              new Date(nextMsg.createdAt).getTime() -
                new Date(msg.createdAt).getTime() >
                5 * 60 * 1000;

            return (
              <React.Fragment key={msg._id}>
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex items-center gap-3 my-6">
                    <Separator className="flex-1" />
                    <Badge
                      variant="secondary"
                      className="px-3 py-1 text-xs font-medium"
                    >
                      {formatDateSeparator(new Date(msg.createdAt))}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                )}

                {/* System Message */}
                {isSystem ? (
                  <div className="flex justify-center my-3">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm border border-border/50">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {msg.content}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Regular Message */
                  <div
                    className={cn(
                      "flex gap-3 group",
                      isMe ? "flex-row-reverse" : "flex-row",
                      isNewGroup ? "mt-4" : "mt-0.5",
                    )}
                  >
                    {/* Avatar - only show for first message in group */}
                    <div className="w-8 shrink-0">
                      {isNewGroup && !isMe && (
                        <Avatar className="h-8 w-8 ring-2 ring-background">
                          <AvatarImage src={msg.sender.avatar} />
                          <AvatarFallback className="text-xs">
                            {(msg.sender.displayName || msg.sender.username)
                              .substring(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        "flex flex-col max-w-[65%]",
                        isMe ? "items-end" : "items-start",
                      )}
                    >
                      {/* Sender name - only for first message in group */}
                      {isNewGroup && !isMe && (
                        <span className="text-xs font-medium text-muted-foreground mb-1 px-1">
                          {msg.sender.displayName || msg.sender.username}
                        </span>
                      )}

                      {/* Message bubble */}
                      <div
                        className={cn(
                          "px-4 py-2.5 rounded-2xl transition-all",
                          "hover:shadow-md",
                          isMe
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/80 backdrop-blur-sm border border-border/50",
                          isNewGroup && isMe && "rounded-tr-md",
                          isNewGroup && !isMe && "rounded-tl-md",
                          isLastInGroup && isMe && "rounded-br-md",
                          isLastInGroup && !isMe && "rounded-bl-md",
                        )}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                          {msg.content}
                        </p>

                        {/* Timestamp - show on last message in group or on hover */}
                        {isLastInGroup && (
                          <span
                            className={cn(
                              "text-[10px] mt-1.5 block",
                              isMe
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground/60",
                            )}
                          >
                            {format(new Date(msg.createdAt), "h:mm a")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-background/95 backdrop-blur-sm">
        <div className="flex items-end gap-3">
          {/* Attachment buttons */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-xl hover:bg-muted"
              title="Attach image"
            >
              <ImageIcon className="h-4.5 w-4.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 h-10 w-10 rounded-xl hover:bg-muted"
              title="Attach file"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </Button>
          </div>

          {/* Input field */}
          <div className="flex-1 relative">
            <Input
              className="w-full pr-4 pl-4 py-3 min-h-12 rounded-xl bg-muted/50 border-border/50 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
              placeholder={`Message ${name}...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="shrink-0 h-10 w-10 p-0 rounded-xl transition-all hover:scale-105"
            title="Send message"
          >
            <Send className="h-4.5 w-4.5" />
          </Button>
        </div>

        {/* Hint text */}
        <p className="text-[10px] text-muted-foreground/60 mt-2 ml-1">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
