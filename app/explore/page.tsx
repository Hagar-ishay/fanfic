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

  return <></>;
}
