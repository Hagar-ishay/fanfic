"use client";

import type { Fanfic } from "../db/types";
import { KindleSender } from "../server/kindleSender";
import { useSettingsStore } from "../store";
import { toast } from "sonner";
import LoadableIcon from "./base/LoadableIcon";
import { forwardRef, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { SendHorizontal } from "lucide-react";
import { DropdownMenu } from "./base/Dropdown";
import { useToast } from "@/hooks/use-toast";
import { boolean } from "drizzle-orm/mysql-core";
import { Tooltip } from "@/components/base/Tooltip";

export default function SendToKindle({ fanfic }: { fanfic: Fanfic }) {
  const { toast } = useToast();

  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);
  const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

  // const isDisabled = Boolean(
  //   isPending ||
  //     isSuccess ||
  //     (fanfic.lastSent && fanfic.lastSent > fanfic.updatedAt)
  // );
  const isDisabled = false;

  const handleSend = ({
    sendLatestChapters,
  }: {
    sendLatestChapters?: boolean;
  }) => {
    startTransition(async () => {
      try {
        const result = await KindleSender(
          fanfic,
          kindleEmail,
          translationLanguage,
          sendLatestChapters || false,
          latestFinalChapter
        );
        setIsSuccess(result.success);
        if (result.success) {
          toast({
            title: "Send to Kindle:",
            description: "Sent to Kindle successfully!",
          });
        } else {
          toast({
            title: "Send to Kindle:",
            description: "Failed to send to Kindle",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error sending to Kindle:", error);
        toast({
          title: "Send to Kindle:",
          description: "Could not send to Kindle",
          variant: "destructive",
        });
      }
    });
  };

  const Trigger = forwardRef<
    HTMLButtonElement,
    React.ComponentPropsWithoutRef<"button">
  >((props, ref) => (
    <Button ref={ref} disabled={isDisabled} {...props}>
      <LoadableIcon
        DefaultIcon={SendHorizontal}
        isPending={isPending}
        successState={isSuccess}
      />
    </Button>
  ));

  const items = [
    {
      title: "Send Entire Fic",
      onSelect: handleSend,
    },
  ];

  if (
    fanfic.latestStartingChapter &&
    fanfic.latestStartingChapter < latestFinalChapter &&
    fanfic.lastSent
  ) {
    items.push({
      title: `Send chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}`,
      onSelect: () => handleSend({ sendLatestChapters: true }),
    });
  }

  return items.length > 1 ? (
    <DropdownMenu
      tooltip={kindleEmail ? "Send Fic to Kindle" : "Kindle Email not set"}
      trigger={<Trigger />}
      items={items}
    />
  ) : (
    <Tooltip
      description={kindleEmail ? "Send Fic to Kindle" : "Kindle Email not set"}
    >
      <Trigger onClick={() => handleSend({ sendLatestChapters: false })} />
    </Tooltip>
  );
}
