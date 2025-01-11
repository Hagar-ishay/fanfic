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
    <div className="min-h-[calc(100vh-170px)] flex flex-col bg-gradient-to-b from-background to-primary/5">
      <div className="flex flex-col items-center justify-center px-4 py-8 flex-1">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Welcome to Penio Fanfic</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-10">
          <Link
            href="/explore"
            className="bg-primary/90 hover:bg-primary transition-all hover:scale-105 text-primary-foreground rounded-xl items-center justify-center flex flex-col gap-3 p-6 w-full md:w-48 h-32 md:h-40 font-bold text-xl shadow-lg"
          >
            <SearchIcon size={32} />
            Explore
          </Link>
          <Link
            href="/library"
            className="bg-primary/90 hover:bg-primary transition-all hover:scale-105 text-primary-foreground rounded-xl items-center justify-center flex flex-col gap-3 p-6 w-full md:w-48 h-32 md:h-40 font-bold text-xl shadow-lg"
          >
            <LibraryIcon size={32} />
            Library
          </Link>
        </div>
      </div>
    </div>
  );
}
