import { listFanfics, selectSections } from "./db/db";
import React from "react";
import SectionsView from "@/components/main-page/SectionsView";

export const metadata = {
  title: "Penio Fanfic",
  description: "A hub of fanfictions by the Penio de la Putz",
};

export default async function MainPage() {
  const [fanfics, sections] = await Promise.all([
    listFanfics(),
    selectSections(),
  ]);

  return (
    <div>
      <SectionsView fanfics={fanfics} sections={sections} />
    </div>
  );
}
