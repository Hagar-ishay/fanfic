import { selectOrCreateSections, selectSectionFanfic } from "./db/db";
import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import Library from "@/components/Library";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Penio Fanfic",
  description: "A hub of fanfictions by the Penio de la Putz",
};

export default function MainPage() {
  redirect("/library");
}
