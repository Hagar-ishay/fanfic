"use client";

import { Section } from "@/db/types";
import { SendHorizontal, Trash2 } from "lucide-react";
import React, { useRef } from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSection, transferSection } from "@/db/sections";

export function SectionContextMenu({
  section,
  transferableSections,
  trigger,
}: {
  section: Section;
  transferableSections: Section[];
  trigger: React.ReactNode;
}) {
  async function onDelete() {
    await deleteSection(section.id);
  }

  const options = [
    {
      icon: <SendHorizontal size={17} />,
      name: "Transfer Section",
      subItems: [
        ...(section.parentId
          ? [
              {
                name: "Move to Top",
                action: () => transferSection(section.id, null),
              },
            ]
          : []),
        ...transferableSections.map((transfer) => ({
          name: transfer.name,
          action: () => transferSection(section.id, transfer.id),
        })),
      ],
    },
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
