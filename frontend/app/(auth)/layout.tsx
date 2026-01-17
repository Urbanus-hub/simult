"use client";

import Antigravity from "@/components/Antigravity";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background text-foreground">
      {/* Background Animation - Shared across all auth pages */}
      <div className="absolute inset-0 z-0">
        <Antigravity 
          count={150} 
          // key props for the effect
          magnetRadius={15}
          ringRadius={15}
          waveSpeed={0.5}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-4">
        {children}
      </div>
    </div>
  );
}
