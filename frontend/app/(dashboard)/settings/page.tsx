"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconUser, IconSettings } from "@tabler/icons-react";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and application preferences.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/settings/profile">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <IconUser className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Update your personal information and avatar.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/settings/preferences">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <IconSettings className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your interface and notification settings.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
