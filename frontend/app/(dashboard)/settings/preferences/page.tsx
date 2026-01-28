"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconArrowLeft, IconMoon, IconSun } from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function PreferencesPage() {
  const { setTheme, theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Preferences saved");
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/settings">
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Customize your interface and behavior.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Select your preferred theme for the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div
              className={`cursor-pointer rounded-md border-2 p-2 hover:bg-accent hover:text-accent-foreground ${theme === "light" ? "border-primary" : "border-transparent"}`}
              onClick={() => setTheme("light")}
            >
              <div className="space-y-2 rounded-sm bg-[#ecedef] p-2">
                <div className="space-y-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-white p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-[#ecedef]" />
                  <div className="h-2 w-[100px] rounded-lg bg-[#ecedef]" />
                </div>
              </div>
              <div className="block w-full p-2 text-center font-normal">
                Light
              </div>
            </div>

            <div
              className={`cursor-pointer rounded-md border-2 p-2 hover:bg-accent hover:text-accent-foreground ${theme === "dark" ? "border-primary" : "border-transparent"}`}
              onClick={() => setTheme("dark")}
            >
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
              <div className="block w-full p-2 text-center font-normal">
                Dark
              </div>
            </div>

            <div
              className={`cursor-pointer rounded-md border-2 p-2 hover:bg-accent hover:text-accent-foreground ${theme === "system" ? "border-primary" : "border-transparent"}`}
              onClick={() => setTheme("system")}
            >
              <div className="space-y-2 rounded-sm bg-slate-950 p-2">
                <div className="space-y-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-2 w-[80px] rounded-lg bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
                <div className="flex items-center space-x-2 rounded-md bg-slate-800 p-2 shadow-sm">
                  <div className="h-4 w-4 rounded-full bg-slate-400" />
                  <div className="h-2 w-[100px] rounded-lg bg-slate-400" />
                </div>
              </div>
              <div className="block w-full p-2 text-center font-normal">
                System
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t bg-muted/20 px-6 py-4 flex justify-end">
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you want to be notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add notification toggles here if needed using Checkbox */}
          <div className="text-sm text-muted-foreground">
            Notification settings coming soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
