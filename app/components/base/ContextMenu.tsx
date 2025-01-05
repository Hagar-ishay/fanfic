"use client";

import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { getIsDesktop } from "@/lib/utils";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { set } from "react-hook-form";

export type Option = {
  icon?: React.ReactNode;
  name: string;
  action?: () => void;
  disabled?: boolean;
  subItems?: Option[];
};

type MenuSlide = {
  items: Option[];
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
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [menuSlides, setMenuSlides] = useState<MenuSlide[]>([
    { items: options },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isDesktop = getIsDesktop();
  const router = useRouter();

  function handleSelect(option: Option) {
    if (option.action) {
      option.action();
    }
    router.back();
  }

  function handleBack() {
    setActiveIndex((prev) => prev - 1);
    setMenuSlides((prev) => prev.slice(0, -1));
  }

  function handleSubItemClick(option: Option) {
    if (option.subItems?.length) {
      setMenuSlides((prev) => [
        ...prev,
        { items: option.subItems!, parentName: option.name },
      ]);
      setActiveIndex((prev) => prev + 1);
    } else if (option.action) {
      option.action();
      setIsDrawerOpen(false);
    }
  }

  const renderDropdownMenuItems = (items: Option[]) => {
    return items.map((option, index) => {
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
            {renderDropdownMenuItems(option.subItems)}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      ) : (
        <DropdownMenuItem
          key={index}
          onSelect={() => handleSelect(option)}
          disabled={option.disabled}
          className="gap-3 text-sm"
        >
          {option.icon}
          {option.name}
        </DropdownMenuItem>
      );
    });
  };

  return isDesktop ? (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent>
        {renderDropdownMenuItems(options)}
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
        <div className="grid">
          <div
            className="transition duration-500 ease-in-out w-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            <div className="flex">
              {menuSlides.map((slide, slideIndex) => (
                <div
                  key={slideIndex}
                  className="flex flex-col gap-4 min-w-full"
                >
                  {slideIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="self-start h-auto p-0 hover:bg-transparent pl-3"
                    >
                      <ChevronRight className="h-4 w-4 transform rotate-180" />
                      {slide.parentName}
                    </Button>
                  )}

                  {slide.items.map((option, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      onClick={() => handleSubItemClick(option)}
                      disabled={option.disabled}
                      className="justify-between text-sm"
                    >
                      <div className="gap-3 flex flex-row items-center">
                        {option.icon}
                        {option.name}
                      </div>
                      {option.subItems && option.subItems.length > 0 && (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
