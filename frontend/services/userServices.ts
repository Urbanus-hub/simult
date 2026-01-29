import { api } from "@/lib/api";

// user registration
export async function registerUser(
  username: string,
  email: string,
  password: string,
) {
  const response = await api.post("/user/register", {
    username,
    email,
    password,
  });
  return response.data;
}

// user login
export async function loginUser(email: string, password: string) {
  const response = await api.post("/user/login", { email, password });
  return response.data;
}
// fetch user profile
export async function fetchUserProfile() {
  const response = await api.get("/user/profile");
  return response.data;
}

// search users
export async function searchUsers(query: string) {
  const response = await api.get(
    `/users/search?query=${encodeURIComponent(query)}`,
  );
  return response.data;
}
