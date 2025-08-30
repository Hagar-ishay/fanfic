"use client";

import { ContextMenu } from "@/components/base/ContextMenu";
import { deleteSectionFanfic, tranferSectionFanfic } from "@/db/fanfics";
import type {
  Integration,
  Section,
  UserFanfic,
  UserFanficIntegration,
} from "@/db/types";
import logger from "@/logger";

import { useToast } from "@/hooks/use-toast";
import { emailSender } from "@/library/sections/[sectionId]/(server)/email";
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
import {
  enableFanficSync,
  disableFanficSync,
  createFanficIntegration,
} from "@/db/fanficIntegrations";
import { syncToCloud } from "@/lib/cloudSync";
export function FanficContextMenu({
  fanfic,
  sections,
  userIntegrations,
  fanficIntegrations,
  trigger,
}: {
  fanfic: UserFanfic;
  sections: Section[];
  userIntegrations: Integration[];
  fanficIntegrations: UserFanficIntegration[];
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

  const handleToggleSync = async (
    integration: Integration,
    currentlyEnabled: boolean
  ) => {
    try {
      if (currentlyEnabled) {
        await disableFanficSync(fanfic.id, integration.id);
        toast({
          title: "Auto Sync Disabled",
          description: `Disabled auto sync for ${integration.name}`,
        });
      } else {
        await enableFanficSync(fanfic.id, integration.id);
        toast({
          title: "Auto Sync Enabled",
          description: `Enabled daily auto sync for ${integration.name}`,
        });
      }

      // Refresh the page to show updated state
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to update sync settings: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      });
    }
  };

  const handleImmediateSync = async (
    fanfic: UserFanfic,
    integration: Integration
  ) => {
    try {
      toast({
        title: "Syncing...",
        description: `Starting sync of ${fanfic.title} to ${integration.name}`,
      });

      logger.info({ fanficIntegrations, integration });

      const fanficIntegration =
        fanficIntegrations.find((fi) => fi.integration.id === integration.id) ||
        (await createFanficIntegration(fanfic.id, integration.id, false));

      const result = await syncToCloud({
        fanficIntegration: fanficIntegration,
        sectionName: fanfic.sectionName,
        fanficTitle: fanfic.title,
        downloadLink: fanfic.downloadLink,
      });

      if (result.success) {
        toast({
          title: "Sync Complete",
          description: `Successfully synced ${fanfic.title} to ${fanficIntegration.integration.name}`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sync Error",
        description: `Failed to sync: ${error instanceof Error ? error.message : "Unknown error"}`,
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

  const buildIntegrationOptions = () => {
    const options: any[] = [
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
              router.push(
                `/library/sections/${section.id}/fanfics/${fanfic.id}`
              );
            }
          },
        })),
      },
    ];

    const deliveryIntegrations = userIntegrations.filter(
      (i) => i.category === "delivery"
    );
    if (deliveryIntegrations.length > 0) {
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

      options.push({
        icon: <SendHorizontal size={17} />,
        name: "Send to Email",
        subItems: subOptions,
      });
    }

    const cloudIntegrations = userIntegrations.filter(
      (i) => i.category === "cloud_storage"
    );
    for (const integration of cloudIntegrations) {
      const currentFanficIntegration = fanficIntegrations.find(
        (fi) => fi.integrationId === integration.id
      );
      const isEnabled = currentFanficIntegration?.enabled || false;

      const cloudSubItems = [
        {
          name: isEnabled
            ? "Disable auto sync (Daily)"
            : "Enable auto sync (Daily)",
          action: () => handleToggleSync(integration, isEnabled),
        },
        {
          name: "Send now",
          action: () => handleImmediateSync(fanfic, integration),
        },
      ];

      options.push({
        icon: <Cloud size={17} />,
        name: `Cloud Sync (${integration.name})`,
        subItems: cloudSubItems,
      });
    }

    // Add delete option
    options.push({
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
    });

    return options;
  };

  const options = buildIntegrationOptions();

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
