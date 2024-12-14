import { listFanfics, selectSections } from "./db/db";
import React from "react";
import SectionsView from "@/components/main-page/SectionsView";
import { checkForUpdates } from "@/server/updater";

export const metadata = {
  title: "Penio Fanfic",
  description: "A hub of fanfictions by the Penio de la Putz",
};

export default async function MainPage() {
  // const updatePromise = checkForUpdates();

  const [fanfics, sections] = await Promise.all([
    listFanfics(),
    selectSections(),
  ]);

  // updatePromise.catch((err) => console.error("Update check failed:", err));

  return (
    <div>
      <SectionsView fanfics={fanfics} sections={sections} />
    </div>
  );
}
