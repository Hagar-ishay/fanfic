"use client";

import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

export type Option = {
  icon?: React.ReactNode;
  name: string;
  action?: () => void;
  disabled?: boolean;
  subItems?: Option[];
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return isDesktop ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {options.map((option, index) => {
          return option.subItems && !option.disabled ? (
            <DropdownMenuSub key={index}>
              <DropdownMenuSubTrigger
                disabled={option.disabled}
                className="gap-3 text-sm"
              >
                {option.icon}
                {option.name}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {option.subItems.map((subOption, index) => (
                  <DropdownMenuItem
                    key={index}
                    onSelect={subOption.action}
                    disabled={subOption.disabled}
                    className="gap-3 text-sm"
                  >
                    {subOption.icon}
                    {subOption.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          ) : (
            <DropdownMenuItem
              key={index}
              onSelect={option.action}
              disabled={option.disabled}
              className="gap-3 text-sm"
            >
              {option.icon}
              {option.name}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <DrawerDialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerDialogTrigger asChild>{trigger}</DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>{header}</DrawerDialogTitle>
          <DrawerDialogDescription />
        </DrawerDialogHeader>
        <div className="flex flex-col gap-4">
          {options.map((option, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => {
                if (option.subItems && option.subItems.length > 0) {
                } else if (option.action) {
                  option.action();
                  setIsDrawerOpen(false);
                }
              }}
              disabled={option.disabled}
              className="justify-between text-sm"
            >
              <div className="gap-3 flex flex-row items-center">
                {option.icon}
                {option.name}
              </div>
            </Button>
          ))}
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
