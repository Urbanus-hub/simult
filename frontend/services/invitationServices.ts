import { api } from "@/lib/api";

export async function getInvitations(){
    const response = await api.get('invitations/sent')
    return response.data;
}
