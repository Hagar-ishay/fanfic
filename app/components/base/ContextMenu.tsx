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
import { ChevronRight } from "lucide-react";
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
  const [menuSlides, setMenuSlides] = useState<MenuSlide[]>([{ items: options }]);
  const [activeIndex, setActiveIndex] = useState(0);


  function handleBack() {
    setActiveIndex((prev) => prev - 1);
    setMenuSlides((prev) => prev.slice(0, -1));
  }

  function handleSubItemClick(option: Option) {
    if (option.subItems?.length) {
      setMenuSlides((prev) => [...prev, { items: option.subItems!, parentName: option.name }]);
      setActiveIndex((prev) => prev + 1);
    } else if (option.action) {
      void option.action();
      setIsOpen(false);
    }
  }


  return (
    <DrawerDialog open={isOpen} onOpenChange={setIsOpen}>
      <DrawerDialogTrigger asChild>{trigger}</DrawerDialogTrigger>
      <DrawerDialogContent>
        <DrawerDialogHeader>
          <DrawerDialogTitle>{header}</DrawerDialogTitle>
          <DrawerDialogDescription />
        </DrawerDialogHeader>
        <div className="grid overflow-hidden">
          <div
            className="transition duration-500 ease-in-out w-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            <div className="flex">
              {menuSlides.map((slide, slideIndex) => (
                <div key={slideIndex} className="flex flex-col gap-4 min-w-full shrink-0">
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

                  {slide.items.map((option, index) =>
                    option.destructive ? (
                      <ConfirmationModal
                        key={index}
                        onSubmit={() => handleSubItemClick(option)}
                        header={option.confirmationHeader}
                        trigger={
                          <Button variant="destructive" className="justify-between text-sm">
                            <div className="gap-3 flex flex-row items-center">
                              {option.icon}
                              {option.name}
                            </div>
                          </Button>
                        }
                      ></ConfirmationModal>
                    ) : (
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
                        {option.subItems && option.subItems.length > 0 && <ChevronRight className="h-4 w-4" />}
                      </Button>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </DrawerDialogContent>
    </DrawerDialog>
  );
}
