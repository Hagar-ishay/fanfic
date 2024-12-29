"use client";

import { Section, UserFanfic } from "@/db/types";
import { CircleChevronRight, SendHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { useSettingsStore } from "@/store";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { kindleSender } from "@/library/sections/[sectionId]/(server)/kindleSender";
import { deleteSectionFanfic, updateSectionFanfic } from "@/db/fanfics";
import {
  DrawerDialog,
  DrawerDialogContent,
  DrawerDialogDescription,
  DrawerDialogHeader,
  DrawerDialogTitle,
  DrawerDialogTrigger,
} from "@/components/base/DrawerDialogV2";
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
import { FanficHeader } from "@/library/sections/[sectionId]/@fanfics/fanfics/[sectionFanficId]/(components)/FanficHeader";

export function FanficContextMenu({
  fanfic,
  sections,
  trigger,
}: {
  fanfic: UserFanfic;
  sections: Section[];
  trigger: React.ReactNode;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);
  const [shouldDelete, setShouldDelete] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  type Option = {
    icon?: React.ReactNode;
    name: string;
    action?: () => void;
    disabled?: boolean;
    subItems?: Option[];
  };

  const isDisabled = Boolean(
    isPending ||
      isSuccess ||
      (fanfic.lastSent && fanfic.lastSent > fanfic.updatedAt)
  );

  const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

  const handleSend = (sendLatestChapters?: boolean) => {
    startTransition(async () => {
      const result = await kindleSender({
        fanfic,
        kindleEmail,
        translationLanguage,
        sendLatestChapters: sendLatestChapters || false,
        latestFinalChapter,
      });
      setIsSuccess(result.success);
      if (result.success) {
        toast({
          title: "Send to Kindle",
          description: `Sent ${fanfic.title} successfully!`,
        });
      } else {
        toast({
          title: "Send to Kindle",
          description: `Failed to send ${fanfic.title}: ${result.message}`,
          variant: "destructive",
        });
      }
    });
  };

  let subOptions = [
    {
      name: "Send entire work",
      action: () => handleSend(false),
    },
  ];
  if (fanfic.latestStartingChapter) {
    subOptions.push({
      name: `Send Chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}`,
      action: () => handleSend(true),
    });
  }

  const options: Option[] = [
    {
      icon: <CircleChevronRight size={17} />,
      name: "Move section",
      subItems: sections.map((section) => ({
        name: section.displayName,
        action: () => updateSectionFanfic(fanfic.id, { sectionId: section.id }),
      })),
    },
    {
      icon: <SendHorizontal size={17} />,
      name: "Send to Kindle",
      disabled: isDisabled,
      subItems: subOptions,
    },
    {
      icon: <Trash2 size={17} />,
      name: "Delete Fanfic",
      action: () => setShouldDelete(true),
    },
  ];

  return (
    <div>
      <DrawerDialog open={shouldDelete} onOpenChange={setShouldDelete}>
        <DrawerDialogContent>
          <DrawerDialogHeader>
            <DrawerDialogTitle>
              <FanficHeader fanfic={fanfic} />
            </DrawerDialogTitle>
            <DrawerDialogDescription />
          </DrawerDialogHeader>
          <div className="flex flex-row justify-end pr-3 gap-2">
            <Button
              type="submit"
              variant="secondary"
              onClick={() => {
                setShouldDelete(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              onClick={() => {
                deleteSectionFanfic(fanfic.id);
                setShouldDelete(false);
              }}
            >
              Delete
            </Button>
          </div>
        </DrawerDialogContent>
      </DrawerDialog>
      {isDesktop ? (
        <DropdownMenu>
          <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
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
          <DrawerDialogTrigger>{trigger}</DrawerDialogTrigger>
          <DrawerDialogContent>
            <DrawerDialogHeader>
              <DrawerDialogTitle>
                <FanficHeader fanfic={fanfic} />
              </DrawerDialogTitle>
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
      )}
    </div>
  );
}
