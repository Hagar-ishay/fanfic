"use client";

import { ContextMenu, Option } from "@/components/base/Context";
import { Fanfic, Section, UserFanfic } from "@/db/types";
import { deleteFic, updateFic } from "@/server/updater";
import { CircleChevronRight, SendHorizontal, Trash2 } from "lucide-react";
import React from "react";
import { kindleSender } from "../../server/kindleSender";
import { useSettingsStore } from "../../store";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { FanficHeader } from "@/components/main-page/FanficHeader";
import { DrawerDialog } from "@/components/base/DrawerDialog";
import { Button } from "@/components/ui/button";

export function FanficCardContextMenu({
  fanfic,
  sections,
  trigger,
  isPending,
  startTransition,
}: {
  fanfic: UserFanfic;
  sections: Section[];
  trigger: React.ReactNode;
  isPending: boolean;
  startTransition: React.TransitionStartFunction;
}) {
  const { toast } = useToast();

  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);
  const [shouldDelete, setShouldDelete] = useState<boolean>(false);

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

  async function handleTranfser(newSectionId: number) {
    updateFic(fanfic.id, { sectionId: newSectionId });
  }

  async function deleteFanfic() {
    deleteFic(fanfic.id);
  }

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
        action: () => handleTranfser(section.id),
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
      <DrawerDialog
        open={shouldDelete}
        onOpenChange={setShouldDelete}
        title={`Are you sure you want to delete ${fanfic.title}?`}
      >
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
              deleteFanfic();
              setShouldDelete(false);
            }}
          >
            Delete
          </Button>
        </div>
      </DrawerDialog>
      <ContextMenu
        options={options}
        trigger={trigger}
        title={
          <div className="flex flex-col items-center">
            <FanficHeader fanfic={fanfic} />
          </div>
        }
      />
    </div>
  );
}
