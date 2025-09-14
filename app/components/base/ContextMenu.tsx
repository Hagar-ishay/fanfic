"use client";

import { ConfirmationModal } from "@/components/base/ConfirmationModal";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";

export type Option = {
  icon?: React.ReactNode;
  name: string;
  action?: () => void | Promise<void>;
  disabled?: boolean;
  subItems?: Option[];
  destructive?: boolean;
  confirmationHeader?: React.ReactNode;
};

type MenuLevel = {
  options: Option[];
  title?: string;
  parentName?: string;
};

export function ContextMenu({
  options,
  trigger,
  header,
}: {
  options: Option[];
  trigger: React.ReactNode;
  header?: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<MenuLevel[]>([
    { options, title: typeof header === "string" ? header : undefined },
  ]);

  const currentMenu = menuStack[menuStack.length - 1];

  function handleBack() {
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
    }
  }

  function handleOptionClick(option: Option) {
    if (option.subItems?.length) {
      // Navigate to submenu
      setMenuStack((prev) => [
        ...prev,
        {
          options: option.subItems!,
          parentName: option.name,
          title: option.name,
        },
      ]);
    } else if (option.action) {
      // Execute action and close menu
      void option.action();
      setIsOpen(false);
      // Reset to root level for next time
      setMenuStack([
        { options, title: typeof header === "string" ? header : undefined },
      ]);
    }
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      // Reset to root level when closing
      setMenuStack([
        { options, title: typeof header === "string" ? header : undefined },
      ]);
    }
  }

  return (
    <DrawerDialog open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerDialogTrigger>{trigger}</DrawerDialogTrigger>
      <DrawerDialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DrawerDialogHeader>
          <DrawerDialogTitle>
            {menuStack.length > 1 ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="h-auto p-1 hover:bg-transparent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span>{currentMenu.title || currentMenu.parentName}</span>
              </div>
            ) : (
              header
            )}
          </DrawerDialogTitle>
          <DrawerDialogDescription />
        </DrawerDialogHeader>

        <div className="flex flex-col gap-2 pb-4">
          {currentMenu.options.map((option, index) =>
            option.destructive ? (
              <ConfirmationModal
                key={index}
                onSubmit={() => handleOptionClick(option)}
                header={option.confirmationHeader}
                trigger={
                  <Button
                    variant="destructive"
                    className="justify-between text-sm h-12"
                    disabled={option.disabled}
                  >
                    <div className="gap-3 flex flex-row items-center">
                      {option.icon}
                      {option.name}
                    </div>
                  </Button>
                }
              />
            ) : (
              <Button
                key={index}
                variant="ghost"
                onClick={() => handleOptionClick(option)}
                disabled={option.disabled}
                className="justify-between text-sm h-12"
              >
                <div className="gap-3 flex flex-row items-center">
                  {option.icon}
                  {option.name}
                </div>
                {option.subItems && option.subItems.length > 0 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            )
          )}
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
