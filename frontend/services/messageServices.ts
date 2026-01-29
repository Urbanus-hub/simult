import { api } from "@/lib/api";

export async function getRoomMessages(roomId: string, limit = 50, before?: string) {
    let url = `/messages/room/${roomId}?limit=${limit}`;
    if (before) {
        url += `&before=${before}`;
    }
  const response = await api.get(url);
  return response.data; // Expecting { success: true, messages: [] }
}

export async function getDirectMessages(userId: string, limit = 50, before?: string) {
    let url = `/messages/direct/${userId}?limit=${limit}`;
    if (before) {
        url += `&before=${before}`;
    }
  const response = await api.get(url);
  return response.data;
}

export async function sendMessage(data: any) {
    // data = { messageType: 'room'|'direct', room, recipient, content, ... }
    const response = await api.post("/messages", data);
    return response.data;
}
