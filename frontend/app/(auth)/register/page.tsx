import { SignUp } from "@clerk/nextjs";

export default function Register() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignUp />
    </div>
  );
}
