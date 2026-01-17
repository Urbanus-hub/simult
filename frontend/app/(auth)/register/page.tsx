import { SignUp } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
export default function Register() {
    console.log(auth());
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <SignUp />
    </div>
  );
}
