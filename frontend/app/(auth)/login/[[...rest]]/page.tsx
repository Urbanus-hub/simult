"use client";

import { SignIn } from "@clerk/nextjs";
import GlassCard from "@/components/GlassCard";

export default function Login() {
  return (
    <GlassCard className="flex flex-col items-center justify-center py-12">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to continue to your dashboard
            </p>
          </div>
          
          <SignIn 
            forceRedirectUrl="/onboarding"
            appearance={{
              elements: {
                formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "bg-white/5 border border-white/10 text-white hover:bg-white/10",
                socialButtonsBlockButtonText: "text-white",
                formFieldLabel: "text-gray-300",
                formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-gray-500",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                dividerLine: "bg-white/10",
                dividerText: "text-gray-400"
              },
              layout: {
                socialButtonsPlacement: "bottom",
                showOptionalFields: false,
              }
            }}
          />
        </GlassCard>
  );
}
