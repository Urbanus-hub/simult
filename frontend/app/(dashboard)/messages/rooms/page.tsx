"use client"

import * as React from "react"
import { getRooms, getRoom } from "@/services/roomServices"
import { ChatArea } from "@/components/chat-area"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {  MessageCircle, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Room {
    _id: string
    name: string
    avatar?: string
    lastActivity: string
    description?: string
}

export default function RoomChatPage() {
    const [rooms, setRooms] = React.useState<Room[]>([])
    const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchRooms = async () => {
            setLoading(true)
            try {
                const res = await getRooms()
                if (res.success) {
                    setRooms(res.rooms)
                }
            } catch (error) {
                console.error("Failed to fetch rooms", error)
            } finally {
                setLoading(false)
            }
        }
        fetchRooms()
    }, [])

    const selectedRoom = rooms.find(r => r._id === selectedRoomId)

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
            {/* Sidebar List */}
            <div className="w-80 border-r flex flex-col bg-muted/10">
                <div className="p-4 border-b">
                    <h2 className="font-semibold flex items-center gap-2">
                        <Users className="h-4 w-4" /> Rooms
                    </h2>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {loading && <div className="p-4 text-center text-sm text-muted-foreground">Loading rooms...</div>}
                        {!loading && rooms.map(room => (
                            <button
                                key={room._id}
                                onClick={() => setSelectedRoomId(room._id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors text-sm hover:bg-accent",
                                    selectedRoomId === room._id ? "bg-accent" : ""
                                )}
                            >
                                <Avatar className="h-10 w-10 border bg-background">
                                    <AvatarImage src={room.avatar} />
                                    <AvatarFallback>{room.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="overflow-hidden">
                                    <div className="font-medium truncate">{room.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{room.description || "No description"}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedRoomId && selectedRoom ? (
                    <ChatArea 
                        type="room"
                        id={selectedRoomId}
                        name={selectedRoom.name}
                        avatar={selectedRoom.avatar}
                        status="Room"
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <div className="text-center space-y-2">
                            <MessageCircle className="h-12 w-12 mx-auto opacity-20" />
                            <p>Select a room to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
