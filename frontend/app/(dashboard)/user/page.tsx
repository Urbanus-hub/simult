"use client";
import { useAuth } from "@/contexts/AuthContext";


export default function UserDashboard() {
  const { user } = useAuth();
  //check if user is null
  if(!user){
    return null;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Dashboard</h1>
      <p>Welcome to your dashboard.</p>
      {
        user.email
      }
    </div>
  );
}
