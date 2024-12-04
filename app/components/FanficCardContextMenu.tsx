"use client";

import { ContextMenu, Option } from "@/components/base/Context";
import { Fanfic, Section } from "@/db/types";
import { updateFic } from "@/server/updater";
import { CircleChevronRight, SendHorizontal } from "lucide-react";
import React from "react";
import { kindleSender } from "../server/kindleSender";
import { useSettingsStore } from "../store";
import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { FanficHeader } from "@/components/FanficHeader";

export function FanficCardContextMenu({
  fanfic,
  sections,
  trigger,
}: {
  fanfic: Fanfic;
  sections: Section[];
  trigger: React.ReactNode;
}) {
  const { toast } = useToast();

  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);

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
          title: "Send to Kindle:",
          description: "Sent to Kindle successfully!",
        });
      } else {
        toast({
          title: "Send to Kindle:",
          description: `Failed to send to Kindle: ${result.message}`,
          variant: "destructive",
        });
      }
    });
  };

  async function handleTranfser(newSectionId: number) {
    updateFic(fanfic.id, { sectionId: newSectionId });
  }

  let subOptions = [
    {
      name: "Send entire work",
      action: () => handleSend(false),
    },
  ];
  if (fanfic.latestStartingChapter) {
    subOptions.push({
      name: `Send Chapters ${fanfic.latestStartingChapter || 1} - ${latestFinalChapter}`,
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
  ];

  return (
    <ContextMenu
      options={options}
      trigger={trigger}
      title={<FanficHeader fanfic={fanfic} />}
    />
  );
}
