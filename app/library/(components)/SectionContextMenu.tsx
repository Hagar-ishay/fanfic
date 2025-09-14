"use client";

import { Section } from "@/db/types";
import { Trash2, BrushCleaning } from "lucide-react";
import React from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSection, updateSectionCleanup } from "@/db/sections";

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

  async function onToggleCleanup() {
    await updateSectionCleanup(section.id, !section.enableIntegrationCleanup);
  }

  const options = [
    {
      icon: <BrushCleaning size={17} />,
      name: section.enableIntegrationCleanup
        ? "Disable Integration Cleanup"
        : "Enable Integration Cleanup",
      action: onToggleCleanup,
    },
    {
      icon: <Trash2 size={17} />,
      name: "Delete Section",
      confirmationHeader: (
        <div className="flex flex-col gap-2">
          Are you sure you want to delete section {section.name} ?
          <div className="text-sm">
            Fics and Child sections belonging to this section will be removed
            from your library
          </div>
        </div>
      ),
      action: onDelete,
      destructive: true,
    },
  ];

  return (
    <ContextMenu header={section.name} options={options} trigger={trigger} />
  );
}
