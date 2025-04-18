"use client";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-md space-y-8 rounded-lg border bg-card p-6 shadow-lg mx-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to Penio Fanfic</h2>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to your account</p>
        </div>

        <Button
          variant="outline"
          className="w-full gap-2 hover:bg-secondary/80"
          size="lg"
          onClick={() => signIn("google", { callbackUrl: "/library" })}
        >
          <>
            <FcGoogle className="h-5 w-5" />
            Sign in with Google
          </>
        </Button>
      </div>
    </div>
  );
}
