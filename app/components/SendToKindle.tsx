"use client";

import type { Fanfic } from "../db/types";
import { KindleSender } from "../server/kindleSender";
import { useSettingsStore } from "../store";
import { toast } from "sonner";
import LoadableIcon from "./base/LoadableIcon";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { SendHorizontal } from "lucide-react";
import { DropdownMenu } from "./base/Dropdown";

export default function SendToKindle({ fanfic }: { fanfic: Fanfic }) {
  const kindleEmail = useSettingsStore((state) => state.kindleEmail);
  const translationLanguage = useSettingsStore((state) => state.languageCode);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState<undefined | boolean>(undefined);

  const handleSend = () => {
    "hello";
    // startTransition(async () => {
    //   try {
    //     const result = await KindleSender(
    //       fanfic,
    //       kindleEmail,
    //       translationLanguage
    //     );
    //     setIsSuccess(result.success);
    //     if (result.success) {
    //       toast("Sent to Kindle successfully");
    //     } else {
    //       toast.error("Failed to send to Kindle");
    //     }
    //   } catch (error) {
    //     console.error("Error sending to Kindle:", error);
    //     toast.error("Failed to send to Kindle");
    //   }
    // });
  };

  const Trigger = ({ onClick }: { onClick?: typeof handleSend }) => {
    return (
      <Button
        disabled={isPending}
        onClick={onClick ? () => onClick() : undefined}
      >
        <LoadableIcon
          DefaultIcon={SendHorizontal}
          isPending={isPending}
          successState={isSuccess}
        />
      </Button>
    );
  };

  const items = [
    {
      title: "Send Entire Fic",
      onSelect: handleSend,
    },
  ];

  const latestFinalChapter = Number(fanfic.chapterCount?.split("/")[0]);

  if (
    fanfic.latestStartingChapter &&
    fanfic.latestStartingChapter < latestFinalChapter &&
    fanfic.lastSent
  ) {
    const title = `Send chapters ${fanfic.latestStartingChapter} - ${latestFinalChapter}`;
    items.push({
      title: title,
      onSelect: handleSend,
    });
  }

  return items.length > 1 ? (
    <DropdownMenu
      tooltip={kindleEmail ? "Send Fic to Kindle" : "Kindle Email not set"}
      trigger={<Trigger />}
      items={items}
    />
  ) : (
    <Trigger onClick={handleSend} />
  );
}
