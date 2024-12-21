import { listUserSections } from "./db/db";
import React from "react";
import SectionsView from "@/components/main-page/SectionsView";
import { currentUser } from "@clerk/nextjs/server";

export const metadata = {
  title: "Penio Fanfic",
  description: "A hub of fanfictions by the Penio de la Putz",
};

export default async function MainPage() {
  const user = await currentUser();
  if (!user) return <div>Not signed in</div>;

  const sections = await listUserSections(user.id);

  return (
    <div>
      <SectionsView sections={sections} />
    </div>
  );
}
