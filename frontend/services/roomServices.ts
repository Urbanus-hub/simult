import { api } from "@/lib/api";

export async function createRoom(data: any) {
  const response = await api.post("/rooms", data);
  return response.data;
}

export async function getRooms() {
  const response = await api.get("/rooms");
  return response.data;
}

export async function getRoom(id: string) {
  const response = await api.get(`/rooms/${id}`);
  return response.data;
}

// Invitation Services
export async function sendInvitation(
  roomId: string,
  inviteeEmail: string,
  personalMessage?: string,
) {
  const response = await api.post("/invitations", {
    roomId,
    inviteeEmail,
    personalMessage,
  });
  return response.data;
}

export async function getPendingInvitationsForRoom(roomId: string) {
  // Assuming backend has this endpoint, if not we need to add it or filter in frontend
  // Ideally backend should provide this
  // For now, let's assume we might need to implement GET /rooms/:id/invitations or similar
  // Or GET /invitations?roomId=:id
  const response = await api.get(`/invitations?roomId=${roomId}`);
  return response.data;
}
