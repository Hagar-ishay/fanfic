import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { LogOut } from "lucide-react";

export async function Footer() {
  const user = await currentUser();

  return (
    <footer className="py-6 text-center text-sm text-muted-foreground border-t bottom-0 sticky bg-background flex flex-row justify-center gap-3">
      <p>Signed in as {user?.firstName || user?.username}</p>

      <div className="hover:opacity-70 !cursor-pointer relative z-20">
        <SignOutButton>
          <LogOut className="h-4 w-4" />
        </SignOutButton>
      </div>
    </footer>
  );
}
