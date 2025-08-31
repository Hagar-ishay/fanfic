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
  onSubmit: () => void | Promise<void>;
  ref?: React.RefObject<HTMLDivElement>;
  trigger?: React.ReactNode;
  destructive?: boolean;
}) {
  function handleSubmit() {
    void onSubmit();
  }

  return (
    <div>
      <DrawerDialog>
        <DrawerDialogTrigger asChild>
          {trigger ? trigger : <div hidden ref={ref} />}
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
            <DrawerDialogClose asChild>
              <Button
                onClick={() => void handleSubmit()}
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
