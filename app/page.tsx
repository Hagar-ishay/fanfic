import { listFanfics, selectSections } from "./db/db";
import React from "react";
import SectionsView from "@/components/SectionsView";

export const metadata = {
  title: "Penio Fanfic",
  description: "Fanfictions of the Penio de la putz",
};

export default async function MainPage() {
  const fanfics = await listFanfics();
  const sections = await selectSections();

  return (
    <div>
      <SectionsView fanfics={fanfics} sections={sections} />
    </div>
  );
}
