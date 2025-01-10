"use client";
import { ContextMenu } from "@/components/base/ContextMenu";
import LoadableIcon from "@/components/base/LoadableIcon";
import { Tooltip } from "@/components/base/Tooltip";
import { Button } from "@/components/ui/button";
import { AO3_LINK } from "@/consts";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { AddNewSectionButton } from "@/library/(components)/AddNewSectionButton";
import { addFanfic } from "@/library/sections/[sectionId]/(server)/addFanfic";
import { useUser } from "@clerk/nextjs";
import { ClipboardPlus, EllipsisVertical, ListPlus } from "lucide-react";
import { useRef, useTransition } from "react";

export function Options({ sectionId }: { sectionId: number }) {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const { user } = useUser();
  const triggerSectionRef = useRef<HTMLDivElement>(null);

  if (!user) {
    return null;
  }

  const handleAddFanficFromClipboard = async () => {
    const title = "Add Fanfic";
    const clipboardText = await navigator.clipboard.readText();
    if (clipboardText.startsWith(`${AO3_LINK}/works/`)) {
      startTransition(async () => {
        const result = await addFanfic(sectionId, user.id, clipboardText);
        if (result.success) {
          toast({ title, description: "Added Successfully!" });
        } else {
          toast({ title, description: result.message, variant: "destructive" });
        }
      });
    } else {
      toast({
        title,
        description: "Invalid URL. Please copy a valid AO3 fanfic link",
        variant: "destructive",
      });
    }
  };

  const options = [
    {
      icon: <ClipboardPlus />,
      name: "Add Fanfic from Clipboard",
      action: handleAddFanficFromClipboard,
    },
    {
      icon: <ListPlus />,
      name: "Add New Section",
      action: () => {
        triggerSectionRef.current?.click();
      },
    },
  ];

  return (
    <>
      <AddNewSectionButton sectionId={sectionId} ref={triggerSectionRef} />
      {isMobile ? (
        <ContextMenu
          options={options}
          trigger={
            <Button size="icon" variant="ghost">
              <EllipsisVertical />
            </Button>
          }
        />
      ) : (
        <>
          {options.map((option) => (
            <Tooltip description={option.name} key={option.name}>
              <Button
                size="icon"
                variant="ghost"
                onClick={option.action}
                disabled={isPending}
              >
                <LoadableIcon defaultIcon={option.icon} isPending={isPending} />
              </Button>
            </Tooltip>
          ))}
        </>
      )}
    </>
  );
}
