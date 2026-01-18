import { Roles } from "@/types/globals";

export const checkRole = async (role: Roles) => {
  // Get token from cookie
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1];

  if (!token) return false;

  try {
    // Verify token with backend
    const response = await fetch("http://localhost:5000/api/auth/verify", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return false;

    const data = await response.json();
    return data.user?.role === role;
  } catch {
    return false;
  }
};
