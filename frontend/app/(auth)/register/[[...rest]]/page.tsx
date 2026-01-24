"use client";

import { RegisterForm } from "@/components/register-form";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function RegisterPage() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

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

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black transition-colors duration-300 relative py-12">
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

      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 blur-3xl opacity-60" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-50/50 to-teal-50/50 dark:from-blue-900/10 dark:to-teal-900/10 blur-3xl opacity-60" />
      </div>

      <div className="w-full max-w-md px-6 relative z-10">
        {/* Logo/Brand */}
        <div className="mb-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="relative w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-white rounded-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
              <div className="w-3 h-3 bg-white dark:bg-zinc-900 rounded-sm" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Simult
            </span>
          </Link>
        </div>

        <RegisterForm />

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-zinc-400 dark:text-zinc-600">
          <p>
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
