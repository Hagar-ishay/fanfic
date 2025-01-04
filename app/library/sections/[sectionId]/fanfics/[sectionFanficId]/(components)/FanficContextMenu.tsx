"use client";

import { ContextMenu } from "@/components/base/ContextMenu";
import { Delete } from "@/components/base/Delete";
import { deleteSectionFanfic, updateSectionFanfic } from "@/db/fanfics";
import type { Section, UserFanfic } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { kindleSender } from "@/library/sections/[sectionId]/(server)/kindleSender";
import { FanficHeader } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficHeader";
import { useFanficTransition } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficTransitionContext";
import { useSettingsStore } from "@/store";
import { CircleChevronRight, SendHorizontal, Trash2 } from "lucide-react";
import { redirect } from "next/navigation";
import { useState } from "react";

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
  const { isPending, startTransition } = useFanficTransition();

  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);
  const [shouldDelete, setShouldDelete] = useState<boolean>(false);

  type Option = {
    icon?: React.ReactNode;
    name: string;
    action?: () => void;
    disabled?: boolean;
    subItems?: Option[];
  };

  const isDisabled = Boolean(
    isPending(fanfic.id) ||
      isSuccess ||
      (fanfic.lastSent && fanfic.lastSent > fanfic.updatedAt)
  );

  const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

  const handleSend = (sendLatestChapters?: boolean) => {
    startTransition(fanfic.id, async () => {
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

  const subOptions = [
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
        name: section.name,
        action: () =>
          startTransition(fanfic.id, async () => {
            await updateSectionFanfic(fanfic.id, { sectionId: section.id });
            redirect(`/library/sections/${section.id}`);
          }),
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
      <Delete
        onDelete={() =>
          startTransition(fanfic.id, async () => {
            deleteSectionFanfic(fanfic.id);
          })
        }
        open={shouldDelete}
        onOpenChange={setShouldDelete}
        header={`Are you sure you want to delete ${fanfic.title}`}
      />
      <ContextMenu
        options={options}
        trigger={trigger}
        header={<FanficHeader fanfic={fanfic} />}
      />
    </div>
  );
}
