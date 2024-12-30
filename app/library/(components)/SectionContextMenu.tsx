"use client";

import { Section } from "@/db/types";
import { SendHorizontal, Trash2 } from "lucide-react";
import React from "react";

import { ContextMenu } from "@/components/base/ContentMenu";
import { Delete } from "@/components/base/Delete";
import { deleteSection, transferSection } from "@/db/sections";
import { useTransitionStore, useStoreTransition } from "@/store";

export function SectionContextMenu({
  section,
  transferableSections,
  trigger,
}: {
  section: Section;
  transferableSections: Section[];
  trigger: React.ReactNode;
}) {
  const { startTransition } = useStoreTransition();
  const isPending = useTransitionStore((state) => state.isPending);
  const [open, setOpen] = React.useState(false);

  async function onDelete() {
    startTransition(async () => {
      await deleteSection(section.id);
    });
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
      disabled: isPending,
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
      disabled: isPending,
      action: () => setOpen(true),
    },
  ];

  return (
    <>
      <ContextMenu
        header={section.displayName}
        options={options}
        trigger={trigger}
      />
      <Delete
        header={
          <div>
            Are you sure you want to delete section ${section.displayName}?
            <div className="text-sm">
              Fics and Child sections belonging to this section will be removed
              from your library
            </div>
          </div>
        }
        onDelete={onDelete}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
