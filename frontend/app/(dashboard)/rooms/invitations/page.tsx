"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IconArrowLeft, IconCheck, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function RoomInvitationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild className="-ml-2">
          <Link href="/rooms">
            <IconArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Invitations</h1>
          <p className="text-sm text-muted-foreground">
            Manage your pending room invitations.
          </p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Invited By</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Mock Invitation 1 */}
            <TableRow>
              <TableCell className="font-medium">
                <div>Backend Architecture</div>
                <div className="text-xs text-muted-foreground">
                  Technical discussion
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs">
                    A
                  </div>
                  <span>Alice Smith</span>
                </div>
              </TableCell>
              <TableCell>Oct 24, 2023</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    <IconX className="h-4 w-4" />
                    <span className="sr-only">Decline</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-950"
                  >
                    <IconCheck className="h-4 w-4" />
                    <span className="sr-only">Accept</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>

            {/* Mock Invitation 2 */}
            <TableRow>
              <TableCell className="font-medium">
                <div>Design Review</div>
                <div className="text-xs text-muted-foreground">Weekly sync</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-xs">
                    J
                  </div>
                  <span>John Doe</span>
                </div>
              </TableCell>
              <TableCell>Oct 22, 2023</TableCell>
              <TableCell>
                <Badge variant="outline">Pending</Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950"
                  >
                    <IconX className="h-4 w-4" />
                    <span className="sr-only">Decline</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-950"
                  >
                    <IconCheck className="h-4 w-4" />
                    <span className="sr-only">Accept</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
