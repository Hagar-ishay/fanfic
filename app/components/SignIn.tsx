"use client";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, UserPlus } from "lucide-react";

export function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome to Penio Fanfic
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton mode="modal">
            <Button
              className="w-full gap-2 bg-primary hover:bg-primary/90"
              size="lg"
            >
              Sign in with Email
              <ArrowRight className="h-4 w-4" />
            </Button>
          </SignInButton>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-muted-foreground/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                {"Don't have an account?"}
              </span>
            </div>
          </div>
          <SignUpButton mode="modal">
            <Button
              variant="outline"
              className="w-full gap-2 hover:bg-secondary/80"
              size="lg"
            >
              Create an Account
              <UserPlus className="h-4 w-4" />
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}
