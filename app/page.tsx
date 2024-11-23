import { listFanfics, selectSections } from "./db/db";
import React from "react";
import SectionsView from "@/components/SectionsView";

export default async function MainPage() {
  const fanfics = await listFanfics();
  const sections = await selectSections();

  return (
    <div className="flex-1 overflow-y-auto">
      <SectionsView fanfics={fanfics} sections={sections} />
    </div>
  );
}
