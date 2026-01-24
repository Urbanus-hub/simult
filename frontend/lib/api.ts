const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Helper to get token from cookie
function getToken(): string | null {
  if (typeof window === "undefined") return null;

  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  return token || null;
}

// Helper to make authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(typeof options.headers === "object" &&
    options.headers !== null &&
    !Array.isArray(options.headers)
      ? (options.headers as Record<string, string>)
      : {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then((res) => res.json()),

  register: (name: string, email: string, password: string) =>
    fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    }).then((res) => res.json()),

  verify: () => fetchWithAuth("/auth/verify"),
};

// User API
export const userAPI = {
  getProfile: () => fetchWithAuth("/users/profile"),

  updateProfile: (data: { name?: string; email?: string }) =>
    fetchWithAuth("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getUsers: () => fetchWithAuth("/users"),

  getUserById: (id: string) => fetchWithAuth(`/users/${id}`),

  deleteUser: (id: string) =>
    fetchWithAuth(`/users/${id}`, {
      method: "DELETE",
    }),
};

// Admin API
export const adminAPI = {
  getStats: () => fetchWithAuth("/admin/stats"),

  getUsers: () => fetchWithAuth("/admin/users"),

  deleteUser: (id: string) =>
    fetchWithAuth(`/admin/users/${id}`, {
      method: "DELETE",
    }),
};

export default {
  auth: authAPI,
  user: userAPI,
  admin: adminAPI,
};
