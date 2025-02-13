"use client";

import { Section } from "@/db/types";
import { SendHorizontal, Trash2 } from "lucide-react";
import React, { MutableRefObject, useRef } from "react";

import { ContextMenu } from "@/components/base/ContextMenu";
import { ConfirmationModal } from "@/components/base/ConfirmationModal";
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
  const triggerRef = useRef<HTMLDivElement>(null);

  async function onDelete() {
    await deleteSection(section.id);
  }

  type Option = {
    icon?: React.ReactNode;
    name: string;
    action?: () => void;
    disabled?: boolean;
    subItems?: Option[];
  };

  const options: Option[] = [
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
      action: () => {
        triggerRef.current?.click();
      },
    },
  ];

  return (
    <>
      <ContextMenu header={section.name} options={options} trigger={trigger} />
      <ConfirmationModal
        header={
          <div className="flex flex-col gap-2">
            Are you sure you want to delete section {section.name} ?
            <div className="text-sm">
              Fics and Child sections belonging to this section will be removed
              from your library
            </div>
          </div>
        }
        onSubmit={onDelete}
        ref={triggerRef}
        destructive
      />
    </>
  );
}
