import { currentUser } from "@clerk/nextjs/server";
import { LibraryIcon, SearchIcon } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Penio Fanfic - Library",
};

export default async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-primary/5 overflow-hidden overscroll-none">
      <div className="flex flex-col items-center justify-center px-4 h-full overflow-hidden overscroll-none">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to Penio Fanfic</h1>
        </div>

        <div className="flex flex-row gap-10">
          <Link
            href="/explore"
            className="bg-primary/90 hover:bg-primary transition-all hover:scale-105 text-primary-foreground rounded-xl items-center justify-center flex flex-col gap-3 p-6 w-48 h-40 font-bold text-xl shadow-lg"
          >
            <SearchIcon size={32} />
            Explore
          </Link>
          <Link
            href="/library"
            className="bg-primary/90 hover:bg-primary transition-all hover:scale-105 text-primary-foreground rounded-xl items-center justify-center flex flex-col gap-3 p-6 w-48 h-40 font-bold text-xl shadow-lg"
          >
            <LibraryIcon size={32} />
            Library
          </Link>
        </div>
      </div>
    </div>
  );
}
