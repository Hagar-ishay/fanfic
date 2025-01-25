"use client";

import {
  DrawerDialog,
  DrawerDialogClose,
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
  destructive,
  trigger,
}: {
  header?: React.ReactNode;
  onSubmit: Function;
  ref?: React.RefObject<HTMLDivElement>;
  trigger?: React.ReactNode;
  destructive?: boolean;
}) {
  async function handleSubmit() {
    await onSubmit();
  }

  return (
    <div>
      <DrawerDialog>
        <DrawerDialogTrigger asChild>
          {trigger ? <div>{trigger}</div> : <div hidden ref={ref} />}
        </DrawerDialogTrigger>
        <DrawerDialogContent className="pb-5">
          <DrawerDialogHeader>
            <DrawerDialogTitle>{header}</DrawerDialogTitle>
          </DrawerDialogHeader>
          <DrawerDialogDescription hidden />
          <DrawerDialogFooter className="flex flex-row justify-end pr-3 gap-2">
            <DrawerDialogClose>
              <Button variant="secondary">Cancel</Button>
            </DrawerDialogClose>
            <DrawerDialogClose>
              <Button
                onClick={handleSubmit}
                variant={destructive ? "destructive" : "default"}
              >
                {destructive ? "Delete" : "Submit"}
              </Button>
            </DrawerDialogClose>
          </DrawerDialogFooter>
        </DrawerDialogContent>
      </DrawerDialog>
    </div>
  );
}
