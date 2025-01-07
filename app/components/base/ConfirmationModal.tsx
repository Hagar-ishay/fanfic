"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogFooter,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";
import React from "react";

export function ConfirmationModal({
  header,
  onSubmit,
  ref,
}: {
  header?: React.ReactNode;
  onSubmit: Function;
  ref?: React.RefObject<HTMLDivElement>;
}) {
  async function handleDelete() {
    await onSubmit();
  }

  return (
    <div>
      <DrawerDialog>
        <DrawerDialogTrigger>
          <div hidden ref={ref} />
        </DrawerDialogTrigger>
        <DrawerDialogContent className="pb-5">
          <DrawerDialogHeader>
            <DrawerDialogTitle>{header}</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription hidden />
          <DrawerDialogFooter>
            <div className="flex flex-row justify-end pr-3 gap-2">
              <Button type="submit" variant="secondary" onSubmit={() => {}}>
                Cancel
              </Button>
              <Button
                onSubmit={handleDelete}
                type="submit"
                variant="destructive"
              >
                Delete
              </Button>
            </div>
          </DrawerDialogFooter>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
