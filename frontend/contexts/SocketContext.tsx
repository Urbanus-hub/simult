"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, token } = useAuth(); // Assuming useAuth exposes the token
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && !socket) {
      // Need to ensure we get the token, if useAuth doesn't provide it directly we might need to get it from storage
      // But for now assuming AuthContext or localStorage has it
      const storedToken = localStorage.getItem("token");

      if (!storedToken) return;

      const newSocket = io(
        process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
          "http://localhost:5000",
        {
          auth: {
            token: storedToken,
          },
          transports: ["websocket"],
        },
      );

      newSocket.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
