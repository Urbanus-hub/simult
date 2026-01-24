"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.get("/user/profile");

      if (response.data.success) {
        setUser(response.data.user);
      } else {
        removeToken();
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Let existing token persist on error unless 401 (handled by interceptor) 
      // or manually invalidate if needed. 
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/user/login", { email, password });
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    setToken(data.token);
    setUser(data.user);
    
    if (data.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/user");
    }
  };

  const register = async (username: string, email: string, password: string) => {
    const response = await api.post("/user/register", { username, email, password });
    const data = response.data;

    if (!data.success) {
      throw new Error(data.message || "Registration failed");
    }

    setToken(data.token);
    setUser(data.user);
    
    if (data.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/user");
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper functions for token management
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
}

function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}
