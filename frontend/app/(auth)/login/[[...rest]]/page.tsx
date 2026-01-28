"use client";

import { LoginForm } from "@/components/login-form";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    const initialTheme = savedTheme || systemTheme;

    setTheme(initialTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(initialTheme);
  }, []);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/user");
      }
    }
  }, [user, loading, router]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!mounted || (loading && user)) return null;

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300 overflow-hidden relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === "light" ? (
            <HiMoon className="h-5 w-5" />
          ) : (
            <HiSun className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Main Container - Compact & Centered */}
      <div className="w-full max-w-[420px] px-6 -mt-12 animate-in fade-in zoom-in-95 duration-500">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="group">
            <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xl shadow-md group-hover:scale-105 transition-transform duration-300">
              S
            </div>
          </Link>
        </div>

        {/* Form Component */}
        <LoginForm />

        {/* Simple Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-400 dark:text-zinc-600">
            Secured by Simult
          </p>
        </div>
      </div>
    </div>
  );
}
