"use client";
import React from "react";
import {
  DropdownMenu as BaseDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip } from "./Tooltip";

export type Item = {
  // biome-ignore lint/suspicious/noExplicitAny: It could be anything here
  onSelect: (...args: any[]) => void;
  title: string;
};

export const DropdownMenu = React.forwardRef<
  HTMLButtonElement,
  {
    tooltip?: string;
    trigger: React.ReactNode;
    items: Item[];
  }
>(({ tooltip, trigger, items }, ref) => {
  return (
    <BaseDropdownMenu>
      {tooltip ? (
        <Tooltip description={tooltip}>
          <DropdownMenuTrigger asChild>
            {React.cloneElement(trigger as React.ReactElement, { ref })}
          </DropdownMenuTrigger>
        </Tooltip>
      ) : (
        <DropdownMenuTrigger asChild>
          {React.cloneElement(trigger as React.ReactElement, { ref })}
        </DropdownMenuTrigger>
      )}
      <DropdownMenuContent>
        {items.map((item) => (
          <DropdownMenuItem key={item.title} onSelect={item.onSelect}>
            <span>{item.title}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </BaseDropdownMenu>
  );
});

DropdownMenu.displayName = "DropdownMenu";
