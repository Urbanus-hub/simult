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
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response.status === 401) {
    toast.error("Error: Unauthorized. Please log in again.");
    window.location.href = "/login";


  }
  return Promise.reject(error);
    // You can handle specific status codes here if needed
  });


export default api;