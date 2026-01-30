import { api } from "@/lib/api";

export async function getRoomMessages(
  roomId: string,
  limit = 50,
  before?: string,
) {
  let url = `/messages/rooms/${roomId}/messages?limit=${limit}`;
  if (before) {
    url += `&before=${before}`;
  }
  const response = await api.get(url);
  return response.data;
}

export async function getDirectMessages(
  userId: string,
  limit = 50,
  before?: string,
) {
  let url = `/messages/direct/${userId}?limit=${limit}`;
  if (before) {
    url += `&before=${before}`;
  }
  const response = await api.get(url);
  return response.data;
}

export async function sendMessage(data: any) {
  let url = "";

  if (data.messageType === "room" && data.room) {
    url = `/messages/rooms/${data.room}/messages`;
  } else if (data.messageType === "direct" && data.recipient) {
    url = `/messages/direct/${data.recipient}`;
  } else {
    throw new Error("Invalid message type or missing data");
  }

  const response = await api.post(url, {
    content: data.content,
    replyTo: data.replyTo,
  });
  return response.data;
}
