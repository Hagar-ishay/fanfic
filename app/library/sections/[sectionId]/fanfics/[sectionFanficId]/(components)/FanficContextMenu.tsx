"use client";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSectionFanfic, tranferSectionFanfic } from "@/db/fanfics";
import type { Section, UserFanfic } from "@/db/types";
import { useToast } from "@/hooks/use-toast";
import { emailSender } from "@/library/sections/[sectionId]/(server)/email";
import { syncToCloud } from "@/lib/cloudSync";
import { FanficHeader } from "@/library/sections/[sectionId]/fanfics/[sectionFanficId]/(components)/FanficHeader";
import {
  CircleChevronRight,
  SendHorizontal,
  Trash2,
  RefreshCw,
  Cloud,
} from "lucide-react";
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
    const result = await emailSender({
      fanfic,
      sendLatestChapters: sendLatestChapters || false,
      latestFinalChapter,
    });
    if (result.success) {
      toast({
        title: "Send to Email",
        description: `Sent ${fanfic.title} successfully!`,
      });
    } else {
      toast({
        title: "Send to Email",
        description: `Failed to send ${fanfic.title}: ${result.message}`,
        variant: "destructive",
      });
    }
  };

  const handleCloudSync = async () => {
    try {
      const result = await syncToCloud(
        fanfic.userId,
        fanfic.sectionId,
        fanfic.title
      );

      toast({
        title: "Cloud Sync",
        description: result.success
          ? `Synced ${fanfic.title} to cloud successfully!`
          : `Failed to sync ${fanfic.title}: ${result.message}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Cloud Sync",
        description: `Failed to sync ${fanfic.title}`,
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
          if (path.includes("/fanfics/")) {
            router.push(`/library/sections/${section.id}/fanfics/${fanfic.id}`);
          }
        },
      })),
    },
    {
      icon: <SendHorizontal size={17} />,
      name: "Send to Email",
      subItems: subOptions,
    },
    {
      icon: <Cloud size={17} />,
      name: "Sync to Cloud",
      action: () => handleCloudSync(),
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
      <ContextMenu
        options={options}
        trigger={trigger}
        header={<FanficHeader fanfic={fanfic} />}
      />
    </div>
  );
}
