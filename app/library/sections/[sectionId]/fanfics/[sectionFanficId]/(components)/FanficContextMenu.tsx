"use client";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSectionFanfic, tranferSectionFanfic } from "@/db/fanfics";
import type { Section, UserFanfic } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { kindleSender } from "@/library/sections/[sectionId]/(server)/kindleSender";
import { FanficHeader } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficHeader";
import { CircleChevronRight, SendHorizontal, Trash2, RefreshCw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { checkAndUpdateFanfic } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(server)/updateFanfic";

export function FanficContextMenu({
  fanfic,
  sections,
  trigger,
}: {
  fanfic: UserFanfic;
  sections: Section[];
  trigger?: React.ReactNode;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const path = usePathname();

  const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

  const handleSend = async (sendLatestChapters?: boolean) => {
    const result = await kindleSender({
      fanfic,
      sendLatestChapters: sendLatestChapters || false,
      latestFinalChapter,
    });
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
  };

  const handleUpdate = async () => {
    const result = await checkAndUpdateFanfic({
      fanficId: fanfic.fanficId,
      externalId: fanfic.externalId,
      title: fanfic.title,
      updatedAt: fanfic.updatedAt,
      sectionId: fanfic.sectionId,
    });

    toast({
      title: "Update Fanfic",
      description: result.message,
      variant: result.success ? "default" : "destructive",
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

  const options = [
    {
      icon: <RefreshCw size={17} />,
      name: "Check for updates",
      action: handleUpdate,
    },
    {
      icon: <CircleChevronRight size={17} />,
      name: "Move section",
      subItems: sections.map((section) => ({
        name: section.name,
        action: async () => {
          await tranferSectionFanfic(fanfic.id, section.id, fanfic.sectionId);
          router.push(`/library/sections/${section.id}`);
        },
      })),
    },
    {
      icon: <SendHorizontal size={17} />,
      name: "Send to Kindle",
      subItems: subOptions,
    },
    {
      icon: <Trash2 size={17} />,
      name: "Delete Fanfic",
      destructive: true,
      confirmationHeader: `Are you sure you want to delete ${fanfic.title}`,
      action: async () => {
        await deleteSectionFanfic(fanfic.id);
        if (path.includes("/fanfics/")) {
          router.back();
        }
      },
    },
  ];

  return (
    <div>
      <ContextMenu options={options} trigger={trigger} header={<FanficHeader fanfic={fanfic} />} />
    </div>
  );
}
