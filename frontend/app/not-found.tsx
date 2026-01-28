"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useEffect, useState } from "react";
import { HiMoon, HiSun } from "react-icons/hi2";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden relative p-4 transition-colors duration-300">
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

      {/* Background Gradient - Matching Auth Pages */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 blur-3xl opacity-60 animate-pulse" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-50/50 to-teal-50/50 dark:from-blue-900/10 dark:to-teal-900/10 blur-3xl opacity-60 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
        {/* glitched 404 container */}
        <div className="relative">
          <h1 className="text-[150px] font-black leading-none text-transparent bg-clip-text bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-800 dark:to-transparent select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <SearchX className="w-24 h-24 text-zinc-900 dark:text-white drop-shadow-2xl" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
            Lost in the void?
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg">
            The page you're looking for seems to have drifted away into deep
            space, or maybe it never existed in this dimension.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
          <Button
            asChild
            size="lg"
            className="rounded-xl h-12 px-8 bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all font-semibold"
          >
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-xl h-12 px-8 border-zinc-200 dark:border-zinc-800 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white transition-all font-semibold"
          >
            <Link href="#" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer / Copyright similar text */}
      <div className="absolute bottom-8 text-center text-xs text-zinc-400 dark:text-zinc-600 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
        <p>Error Code: 404 • Resource Not Found</p>
      </div>
    </div>
  );
}
