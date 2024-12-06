import {
  ContextMenu as BaseContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type Option = {
  icon?: React.ReactNode;
  name: string;
  action?: () => void;
  disabled?: boolean;
  subItems?: Option[];
};

export function ContextMenu({
  title,
  options,
  trigger,
}: {
  title?: React.ReactNode;
  options: Option[];
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);
  const [menuOptionsList, setMenuOptionsList] = React.useState<Option[][]>([
    options,
  ]);

  const MenuItem = ({ option }: { option: Option }) => {
    return (
      <ContextMenuItem
        onSelect={option.action}
        disabled={option.disabled}
        className="gap-3 text-sm"
      >
        {option.icon}
        {option.name}
      </ContextMenuItem>
    );
  };

  const ButtonMenuItem = ({ option }: { option: Option }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => {
          if (option.subItems && option.subItems.length > 0) {
            return setMenuOptionsList([...menuOptionsList, option.subItems]);
          }
          if (option.action) {
            setOpen(false);
            setMenuOptionsList([options]);
            return option.action();
          }
        }}
        disabled={option.disabled}
        className="justify-between text-sm"
      >
        <div className="gap-3 flex flex-row items-center">
          {option.icon}
          {option.name}
        </div>
        {option.subItems && <ChevronRight />}
      </Button>
    );
  };

  const DesktopContextMenu = () => {
    return (
      <ContextMenuContent>
        {options.map((option, index) => {
          return option.subItems && !option.disabled ? (
            <ContextMenuSub key={index}>
              <ContextMenuSubTrigger
                disabled={option.disabled}
                className="gap-3 text-sm"
              >
                {option.icon}
                {option.name}
              </ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {option.subItems.map((subOption, index) => (
                  <MenuItem key={index} option={subOption} />
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          ) : (
            <MenuItem key={index} option={option} />
          );
        })}
      </ContextMenuContent>
    );
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <BaseContextMenu>
        <ContextMenuTrigger>{trigger}</ContextMenuTrigger>
        <DesktopContextMenu />
      </BaseContextMenu>
    );
  }
  return (
    <div
      onContextMenu={(e) => {
        e.preventDefault();
        setOpen(true);
      }}
    >
      {trigger}
      <Drawer
        open={open}
        onOpenChange={(open) => {
          setOpen(open);
          if (!open) setMenuOptionsList([options]);
        }}
      >
        <DrawerContent className="flex flex-col max-h-screen">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-hidden">
            <div
              className="flex h-full transition-transform duration-500"
              style={{
                transform: `translateX(-${
                  (menuOptionsList.length - 1) * 100
                }%)`,
              }}
            >
              {menuOptionsList.map((menuOptions, menuIndex) => (
                <div key={menuIndex} className="flex-shrink-0 w-full">
                  <div className="flex flex-col p-4 h-full">
                    {menuIndex > 0 && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          const newMenuOptionsList = menuOptionsList.slice(
                            0,
                            -1
                          );
                          setMenuOptionsList(newMenuOptionsList);
                        }}
                        className="justify-start hover:bg-muted"
                      >
                        <ChevronLeft />
                      </Button>
                    )}
                    {menuOptions.map((option, index) => (
                      <ButtonMenuItem key={index} option={option} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
