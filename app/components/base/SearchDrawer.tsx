"use client";

import { useState, ReactNode } from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "./DrawerDialog";
import { DrawerDescription } from "@/components/ui/drawer";
import { cn, getIsDesktop } from "@/lib/utils";

interface SearchDrawerProps {
  trigger: ReactNode;
  placeholder: string;
  children: (searchInput: string, closeDrawer: () => void) => ReactNode;
  onInputChange?: (value: string) => void;
}

export function SearchDrawer({
  trigger,
  placeholder,
  children,
  onInputChange,
}: SearchDrawerProps) {
  const [searchInput, setSearchInput] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isDesktop = getIsDesktop();

  const handleInputChange = (value: string) => {
    setSearchInput(value);
    onInputChange?.(value);
  };

  return (
    <DrawerDialog open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerDialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent/80 hover:text-accent-foreground h-9 w-9 p-0">{trigger}</DrawerDialogTrigger>
      <DrawerDialogContent className={cn("p-4", isDesktop ? "" : "h-full")}>
        <DrawerDialogHeader hidden>
          <DrawerDialogTitle></DrawerDialogTitle>
        </DrawerDialogHeader>
        <DrawerDescription></DrawerDescription>

        <div className="relative">
          <Input
            value={searchInput}
            onChange={(e) => handleInputChange(e.target.value)}
            autoFocus
            type="search"
            placeholder={placeholder}
            className={cn(
              "w-full pr-4 bg-background border border-input rounded-xl shadow-sm text-sm transition-colors hover:border-accent/50 focus-visible:ring-1 focus-visible:ring-accent text-muted-foreground caret-muted-foreground/50",
              isDesktop ? "py-2 pl-9" : "py-3 pl-10"
            )}
          />
          <SearchIcon
            className={cn(
              "pointer-events-none absolute left-3 size-4 top-1/2 -translate-y-1/2 select-none opacity-50"
            )}
          />
        </div>

        {children(searchInput, () => setIsDrawerOpen(false))}
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
