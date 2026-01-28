"use client";

import { useAuth } from "@/contexts/AuthContext";

export function WelcomeBanner() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col gap-1 px-4 lg:px-6 mt-6 mb-2">
      <h1 className="text-2xl font-bold tracking-tight">
        {getGreeting()}, {user?.username || "Guest"}!
      </h1>
      <p className="text-muted-foreground">
        Here's what's happening in your workspace today.
      </p>
    </div>
  );
}
