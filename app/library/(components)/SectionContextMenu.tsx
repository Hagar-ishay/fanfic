"use client";

import { Section } from "@/db/types";
import { Trash2 } from "lucide-react";
import React from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSection } from "@/db/sections";

export function SectionContextMenu({
  section,
  trigger,
}: {
  section: Section;
  trigger: React.ReactNode;
}) {
  async function onDelete() {
    await deleteSection(section.id);
  }

  const options = [
    {
      icon: <Trash2 size={17} />,
      name: "Delete Section", 
      confirmationHeader: (
        <div className="flex flex-col gap-2">
          Are you sure you want to delete section {section.name} ?
          <div className="text-sm">
            Fics and Child sections belonging to this section will be removed from your library
          </div>
        </div>
      ),
      action: onDelete,
      destructive: true,
    },
  ];

  return <ContextMenu header={section.name} options={options} trigger={trigger} />;
}
