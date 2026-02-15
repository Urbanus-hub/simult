"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Calendar,
  User,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface InvitationDetails {
  id: string;
  room: {
    _id: string;
    name: string;
    description?: string;
    avatar?: string;
    memberCount?: number;
  };
  inviter: {
    _id: string;
    username: string;
    displayName?: string;
    avatar?: string;
  };
  inviteeEmail: string;
  status: string;
  expiresAt: string;
  personalMessage?: string;
}

export default function AcceptInvitationPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthAndLoadInvitation();
  }, [token]);

  const checkAuthAndLoadInvitation = async () => {
    try {
      // Check if user is logged in
      const authToken = localStorage.getItem("token");
      setIsAuthenticated(!!authToken);

      // Fetch invitation details
      const response = await api.get(`/invitations/token/${token}`);

      if (response.data.success) {
        setInvitation(response.data.invitation);
      } else {
        setError(response.data.message || "Invalid invitation");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!isAuthenticated) {
      toast.info(
        "Please log in or create an account to accept this invitation",
      );
      router.push(`/login?redirect=/invitation/accept/${token}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post(`/invitations/accept/${token}`);

      if (response.data.success) {
        toast.success("Invitation accepted! Redirecting to room...");
        setTimeout(() => {
          router.push(`/rooms/${response.data.room._id}`);
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to accept invitation");
        setProcessing(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept invitation");
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!isAuthenticated) {
      toast.info("Please log in to decline this invitation");
      router.push(`/login?redirect=/invitation/accept/${token}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post(`/invitations/decline/${token}`);

      if (response.data.success) {
        toast.success("Invitation declined");
        setTimeout(() => {
          router.push("/rooms");
        }, 1500);
      } else {
        toast.error(response.data.message || "Failed to decline invitation");
        setProcessing(false);
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to decline invitation",
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-2 text-destructive mb-2">
              <XCircle className="h-6 w-6" />
              <CardTitle>Invalid Invitation</CardTitle>
            </div>
            <CardDescription>
              {error || "This invitation link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={isAuthenticated ? "/rooms" : "/"}>
                {isAuthenticated ? "Go to Rooms" : "Go to Home"}
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(invitation.expiresAt) < new Date();
  const isAlreadyProcessed = invitation.status !== "pending";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Room Invitation</CardTitle>
              <CardDescription>
                You've been invited to collaborate
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Room Information */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold text-lg mb-2">
              {invitation.room.name}
            </h3>
            {invitation.room.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {invitation.room.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {invitation.room.memberCount && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{invitation.room.memberCount} members</span>
                </div>
              )}
            </div>
          </div>

          {/* Inviter Information */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50 border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Invited by</p>
              <p className="font-medium">
                {invitation.inviter.displayName || invitation.inviter.username}
              </p>
            </div>
          </div>

          {/* Personal Message */}
          {invitation.personalMessage && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium mb-1">Personal message:</p>
              <p className="text-sm text-muted-foreground italic">
                "{invitation.personalMessage}"
              </p>
            </div>
          )}

          {/* Expiration Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>
              {isExpired
                ? "This invitation has expired"
                : `Expires on ${new Date(invitation.expiresAt).toLocaleDateString()}`}
            </span>
          </div>

          {/* Status Messages */}
          {isAlreadyProcessed && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-900 dark:text-yellow-100">
              <p className="text-sm font-medium">
                This invitation has already been {invitation.status}.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
              <p className="text-sm font-medium">
                This invitation has expired and can no longer be accepted.
              </p>
            </div>
          )}

          {!isAuthenticated && !isExpired && !isAlreadyProcessed && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-900 dark:text-blue-100">
              <p className="text-sm font-medium mb-2">
                You need to log in or create an account
              </p>
              <p className="text-sm mb-3">
                You'll be redirected back here after logging in.
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="default">
                  <Link href={`/login?redirect=/invitation/accept/${token}`}>
                    Log In
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/register?redirect=/invitation/accept/${token}`}>
                    Create Account
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-3">
          {!isExpired && !isAlreadyProcessed ? (
            <>
              <Button
                onClick={handleAccept}
                disabled={processing}
                className="flex-1"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Accept Invitation
                  </>
                )}
              </Button>
              <Button
                onClick={handleDecline}
                disabled={processing}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Decline
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button asChild className="w-full" size="lg">
              <Link href={isAuthenticated ? "/rooms" : "/"}>
                {isAuthenticated ? "Go to My Rooms" : "Go to Home"}
              </Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
