import { SignIn } from "@clerk/nextjs";

export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignIn />
    </div>
  );
}
