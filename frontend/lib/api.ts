import axios from "axios";
import { toast } from "sonner";

const APIURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const api = axios.create({
  baseURL: APIURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't intercept 401s for login requests - let the component handle invalid credentials
    if (
      error.response?.status === 401 &&
      !error.config.url.includes("/login")
    ) {
      console.warn("Session expired or invalid token - Redirecting to login");
      toast.error("Session expired. Please log in again.");
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
