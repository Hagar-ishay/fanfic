"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
} from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";
import React from "react";

export function Delete({
  header,
  onDelete,
  open,
  onOpenChange,
}: {
  header?: React.ReactNode;
  onDelete: Function;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  async function handleDelete() {
    return await onDelete();
  }

  return (
    <div>
      <DrawerDialog open={open} onOpenChange={onOpenChange}>
        <DrawerDialogContent className="pb-5">
          <DrawerDialogHeader>
            <DrawerDialogTitle>{header}</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription />
          <div className="flex flex-row justify-end pr-3 gap-2">
            <Button
              type="submit"
              variant="secondary"
              onClick={() => {
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={() => {
                handleDelete();
                onOpenChange(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
