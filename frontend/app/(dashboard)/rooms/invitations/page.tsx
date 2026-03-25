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
import {
  IconArrowLeft,
  IconCancel,
  IconCheck,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getInvitations } from "@/services/invitationServices";
import { useEffect, useState } from "react";

export default function RoomInvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  useEffect(() => {
    async function loadInvites() {
      const invitationData = await getInvitations();
      setInvitations(invitationData?.invitations);
    }

    loadInvites();
  }, []);
  console.log("invitations:", invitations);

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
            Manage your room(s) invitations.
          </p>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Invitee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations ? (
              invitations.map((invite: any, key: number) => {
                return (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      <div>{invite?.room?.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {invite.room.description.length
                          ? invite.room.description
                          : invite.room.description.slice(0, 21).concat("...")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs">
                          A
                        </div>
                        <span>{invite.inviteeUser.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{invite.createdAt}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{invite.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className={`h-10 w-15 p-0 border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-red-900 dark:hover:bg-red-950 group relative ${invite.status=="accepted"?'underline':''}`}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 w-15 p-0 border-green-200 hover:bg-green-50 hover:text-green-600 dark:border-green-900 dark:hover:bg-green-950"
                        >
                          Resend
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <h2 className='dark:text-white light:text-black'>No invitations</h2>
            )}

          
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
